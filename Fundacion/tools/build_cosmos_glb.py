"""
Gendanken Palast - Fusión de modelos 3D
Combina alien_space_nebula_2_skybox.glb (nebulosa envolvente) y need_some_space.glb
(nube de 50.000 puntos) en un único gedankenpalast_cosmos.glb.

La nube se remodela en los 4 cúmulos de atlas.js (Ciencias Actuariales, Data Science,
Economía y Finanzas, Matemáticas y Probabilidad) y en el núcleo del Gran Atractor.
Todo queda en las mismas unidades que CLUSTERS, así que main.js no reescala nada.

Uso:  python -I tools/build_cosmos_glb.py
Vuelve a ejecutarlo si cambian los centros o radios de CLUSTERS en atlas.js.
"""
import json
import re
import struct
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
NEBULA_GLB = ROOT / "alien_space_nebula_2_skybox.glb"
POINTS_GLB = ROOT / "need_some_space.glb"
ATLAS_JS = ROOT / "atlas.js"
OUT_GLB = ROOT / "gedankenpalast_cosmos.glb"

NEBULA_OUTER_RADIUS = 9000.0   # > controls.maxDistance: la cámara nunca sale de la nebulosa
CORE_FRACTION = 0.12           # puntos que forman el núcleo del Gran Atractor
CORE_RADIUS = 60.0
CORE_COLOR = np.array([1.0, 0.94, 0.82])
CLUSTER_AXES = np.array([1.0, 0.62, 0.82])  # cúmulos triaxiales, no esferas perfectas
HUE_MIX = 0.78                 # mezcla del tono del cúmulo con blanco estelar
SEED = 1987

COMPONENT_DTYPES = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
TYPE_SIZES = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}


# ---------------------------------------------------------------------------
# LECTURA GLB
# ---------------------------------------------------------------------------
def read_glb(path):
    data = path.read_bytes()
    magic, version, _ = struct.unpack("<4sII", data[:12])
    assert magic == b"glTF" and version == 2, f"{path.name} no es un GLB 2.0"
    offset, gltf, binary = 12, None, b""
    while offset < len(data):
        length, kind = struct.unpack("<I4s", data[offset:offset + 8])
        chunk = data[offset + 8:offset + 8 + length]
        if kind == b"JSON":
            gltf = json.loads(chunk)
        elif kind == b"BIN\x00":
            binary = chunk
        offset += 8 + length
    return gltf, binary


def read_accessor(gltf, binary, index):
    acc = gltf["accessors"][index]
    view = gltf["bufferViews"][acc["bufferView"]]
    dtype = np.dtype(COMPONENT_DTYPES[acc["componentType"]])
    size = TYPE_SIZES[acc["type"]]
    start = view.get("byteOffset", 0) + acc.get("byteOffset", 0)
    stride = view.get("byteStride", dtype.itemsize * size)
    rows = np.ndarray((acc["count"], size), dtype=dtype, buffer=binary, offset=start, strides=(stride, dtype.itemsize))
    out = rows.astype(np.float64)
    if acc.get("normalized") and dtype.kind in "ui":
        out /= np.iinfo(dtype).max
    return out[:, 0] if size == 1 else out


def node_matrix(node):
    if "matrix" in node:
        return np.array(node["matrix"], dtype=np.float64).reshape(4, 4).T
    m = np.eye(4)
    if "scale" in node:
        m = np.diag([*node["scale"], 1.0]) @ m
    if "rotation" in node:
        x, y, z, w = node["rotation"]
        r = np.array([
            [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
            [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
            [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
        ])
        rot = np.eye(4)
        rot[:3, :3] = r
        m = rot @ m
    if "translation" in node:
        m[:3, 3] += node["translation"]
    return m


def mesh_world_matrices(gltf):
    """Devuelve [(mesh_index, matriz_mundo)] recorriendo la escena por defecto."""
    found = []

    def walk(idx, parent):
        node = gltf["nodes"][idx]
        world = parent @ node_matrix(node)
        if "mesh" in node:
            found.append((node["mesh"], world))
        for child in node.get("children", []):
            walk(child, world)

    scene = gltf["scenes"][gltf.get("scene", 0)]
    for root in scene["nodes"]:
        walk(root, np.eye(4))
    return found


def transform(points, matrix):
    return points @ matrix[:3, :3].T + matrix[:3, 3]


# ---------------------------------------------------------------------------
# CÚMULOS (leídos de atlas.js para no duplicar datos)
# ---------------------------------------------------------------------------
def read_clusters():
    source = ATLAS_JS.read_text(encoding="utf-8")
    pattern = (r"\{\s*id:\s*'(\w+)',\s*name:\s*'[^']*',\s*hue:\s*'#([0-9a-fA-F]{6})',\s*"
               r"center:\s*\[([^\]]+)\],\s*radius:\s*([\d.]+)")
    clusters = []
    for m in re.finditer(pattern, source):
        clusters.append({
            "id": m.group(1),
            "hue": np.array([int(m.group(2)[i:i + 2], 16) / 255 for i in (0, 2, 4)]),
            "center": np.array([float(v) for v in m.group(3).split(",")]),
            "radius": float(m.group(4)),
        })
    assert len(clusters) == 4, f"Se esperaban 4 cúmulos en atlas.js, hay {len(clusters)}"
    return clusters


# ---------------------------------------------------------------------------
# NUBE DE PUNTOS -> CÚMULOS DE LANIAKEA
# ---------------------------------------------------------------------------
def principal_axes(points):
    centered = points - points.mean(axis=0)
    _, vecs = np.linalg.eigh(np.cov(centered.T))
    return centered, vecs[:, ::-1]  # columnas ordenadas por varianza descendente


def rank01(values):
    order = np.argsort(values, kind="stable")
    ranks = np.empty(len(values))
    ranks[order] = np.linspace(0.0, 1.0, len(values))
    return ranks


def random_rotation(rng):
    q, r = np.linalg.qr(rng.normal(size=(3, 3)))
    q *= np.sign(np.diag(r))
    return q if np.linalg.det(q) > 0 else -q


def concentrate(points, center, radius, axes, exponent, rotation):
    """Lleva un trozo de la nube a un cúmulo triaxial denso en el centro.

    Conserva la dirección de cada punto respecto al eje propio del trozo (su subestructura real)
    y reasigna el radio por rango con un perfil u**exponent, más denso cuanto mayor el exponente.
    """
    local, local_axes = principal_axes(points)
    coords = local @ local_axes
    coords /= coords.std(axis=0) + 1e-9
    dist = np.linalg.norm(coords, axis=1, keepdims=True) + 1e-9
    radial = radius * (rank01(dist[:, 0]) ** exponent)[:, None]
    return center + ((coords / dist) * radial * axes) @ rotation.T


def mould_point_cloud(raw_points, raw_colors, clusters):
    rng = np.random.default_rng(SEED)
    n = len(raw_points)
    luminance = raw_colors[:, :3] @ np.array([0.2126, 0.7152, 0.0722])
    luminance = np.clip(luminance / max(luminance.max(), 1e-6), 0, 1)
    shade = 0.45 + 0.55 * luminance

    centered, axes = principal_axes(raw_points)
    out_pos = np.zeros((n, 3))
    out_col = np.zeros((n, 3))

    # Reparto en cuñas contiguas por azimut alrededor del eje principal (preserva vecindarios):
    # primero el núcleo del Gran Atractor, luego un cúmulo por cuña con peso radio**2
    order = np.argsort(np.arctan2(centered @ axes[:, 2], centered @ axes[:, 1]), kind="stable")
    weights = np.array([CORE_FRACTION] + [(1 - CORE_FRACTION) * c["radius"] ** 2 for c in clusters])
    weights[1:] /= sum(c["radius"] ** 2 for c in clusters)
    cuts = np.round(np.cumsum(weights) * n).astype(int)[:-1]
    chunks = np.split(order, cuts)

    core = chunks[0]
    out_pos[core] = concentrate(raw_points[core], np.zeros(3), CORE_RADIUS, np.ones(3), 2.2, random_rotation(rng))
    out_col[core] = CORE_COLOR * shade[core, None]

    stats = [("núcleo", len(core))]
    for cluster, idx in zip(clusters, chunks[1:]):
        out_pos[idx] = concentrate(raw_points[idx], cluster["center"], cluster["radius"] * 1.15,
                                   CLUSTER_AXES, 1.7, random_rotation(rng))
        tint = cluster["hue"] * HUE_MIX + (1 - HUE_MIX)
        out_col[idx] = tint * shade[idx, None]
        stats.append((cluster["id"], len(idx)))

    return out_pos, np.clip(out_col, 0, 1), stats


# ---------------------------------------------------------------------------
# ESCRITURA GLB
# ---------------------------------------------------------------------------
class GlbBuilder:
    def __init__(self):
        self.binary = bytearray()
        self.buffer_views = []
        self.accessors = []

    def _pad(self):
        while len(self.binary) % 4:
            self.binary.append(0)

    def add_view(self, raw, target=None, stride=None):
        self._pad()
        view = {"buffer": 0, "byteOffset": len(self.binary), "byteLength": len(raw)}
        if target:
            view["target"] = target
        if stride:
            view["byteStride"] = stride
        self.binary.extend(raw)
        self.buffer_views.append(view)
        return len(self.buffer_views) - 1

    def add_accessor(self, array, component, kind, target, normalized=False, stride=None, with_bounds=False):
        raw = np.ascontiguousarray(array).tobytes()
        view = self.add_view(raw, target, stride)
        acc = {"bufferView": view, "componentType": component, "count": len(array), "type": kind}
        if normalized:
            acc["normalized"] = True
        if with_bounds:
            acc["min"] = array.min(axis=0).astype(float).tolist()
            acc["max"] = array.max(axis=0).astype(float).tolist()
        self.accessors.append(acc)
        return len(self.accessors) - 1

    def write(self, path, gltf):
        self._pad()
        gltf["bufferViews"] = self.buffer_views
        gltf["accessors"] = self.accessors
        gltf["buffers"] = [{"byteLength": len(self.binary)}]
        json_bytes = json.dumps(gltf, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
        json_bytes += b" " * (-len(json_bytes) % 4)
        total = 12 + 8 + len(json_bytes) + 8 + len(self.binary)
        with open(path, "wb") as fh:
            fh.write(struct.pack("<4sII", b"glTF", 2, total))
            fh.write(struct.pack("<I4s", len(json_bytes), b"JSON"))
            fh.write(json_bytes)
            fh.write(struct.pack("<I4s", len(self.binary), b"BIN\x00"))
            fh.write(self.binary)


def main():
    clusters = read_clusters()
    nebula, nebula_bin = read_glb(NEBULA_GLB)
    cloud, cloud_bin = read_glb(POINTS_GLB)

    # --- Nebulosa: hornear transformaciones y escalar las dos esferas juntas ---
    shells = []
    for mesh_index, world in mesh_world_matrices(nebula):
        prim = nebula["meshes"][mesh_index]["primitives"][0]
        pos = transform(read_accessor(nebula, nebula_bin, prim["attributes"]["POSITION"]), world)
        uv = read_accessor(nebula, nebula_bin, prim["attributes"]["TEXCOORD_0"])
        idx = read_accessor(nebula, nebula_bin, prim["indices"]).astype(np.uint32)
        if np.linalg.det(world[:3, :3]) < 0:
            idx = idx.reshape(-1, 3)[:, ::-1].ravel()
        shells.append({"pos": pos, "uv": uv, "idx": idx, "radius": np.linalg.norm(pos, axis=1).max()})
    shells.sort(key=lambda s: -s["radius"])
    shell_scale = NEBULA_OUTER_RADIUS / shells[0]["radius"]

    emissive = nebula["materials"][0]["emissiveTexture"]["index"]
    image = nebula["images"][nebula["textures"][emissive]["source"]]
    image_view = nebula["bufferViews"][image["bufferView"]]
    png = nebula_bin[image_view.get("byteOffset", 0):image_view.get("byteOffset", 0) + image_view["byteLength"]]

    # --- Nube de puntos: a coordenadas de mundo y remodelada en los cúmulos ---
    (cloud_mesh, cloud_world), = mesh_world_matrices(cloud)
    cloud_prim = cloud["meshes"][cloud_mesh]["primitives"][0]
    raw_points = transform(read_accessor(cloud, cloud_bin, cloud_prim["attributes"]["POSITION"]), cloud_world)
    raw_colors = read_accessor(cloud, cloud_bin, cloud_prim["attributes"]["COLOR_0"])
    positions, colors, stats = mould_point_cloud(raw_points, raw_colors, clusters)

    # --- Ensamblado ---
    builder = GlbBuilder()
    meshes, nodes = [], []
    for name, shell in zip(("NebulaOuter", "NebulaInner"), shells):
        prim = {
            "attributes": {
                "POSITION": builder.add_accessor((shell["pos"] * shell_scale).astype(np.float32), 5126, "VEC3", 34962, with_bounds=True),
                "TEXCOORD_0": builder.add_accessor(shell["uv"].astype(np.float32), 5126, "VEC2", 34962),
            },
            "indices": builder.add_accessor(shell["idx"].astype(np.uint16), 5123, "SCALAR", 34963),
            "material": 0,
        }
        meshes.append({"name": name, "primitives": [prim]})
        nodes.append({"name": name, "mesh": len(meshes) - 1})

    # COLOR_0 en uint8 normalizado con byteStride 4 (alineación obligatoria de atributos)
    rgb = np.zeros((len(colors), 4), dtype=np.uint8)
    rgb[:, :3] = np.round(colors * 255).astype(np.uint8)
    color_acc = builder.add_accessor(rgb, 5121, "VEC3", 34962, normalized=True, stride=4)
    meshes.append({"name": "LaniakeaClusters", "primitives": [{
        "attributes": {
            "POSITION": builder.add_accessor(positions.astype(np.float32), 5126, "VEC3", 34962, with_bounds=True),
            "COLOR_0": color_acc,
        },
        "mode": 0,
        "material": 1,
    }]})
    nodes.append({"name": "LaniakeaClusters", "mesh": len(meshes) - 1})
    nodes.append({"name": "GedankenpalastCosmos", "children": list(range(len(nodes)))})

    png_view = builder.add_view(png)
    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "Gendanken Palast build_cosmos_glb.py",
            "copyright": "Nebulosa: Jungle Jim (CC-BY-4.0). Nube de puntos: Loïc Norgeot (CC-BY-4.0).",
            "extras": {
                "sources": [nebula["asset"].get("extras", {}), cloud["asset"].get("extras", {})],
                "clusters": [c["id"] for c in clusters],
            },
        },
        "extensionsUsed": ["KHR_materials_unlit"],
        "scene": 0,
        "scenes": [{"name": "GedankenpalastCosmos", "nodes": [len(nodes) - 1]}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": [
            {
                "name": "Nebula",
                "doubleSided": True,
                "alphaMode": "BLEND",
                "pbrMetallicRoughness": {"baseColorFactor": [1, 1, 1, 0.83], "baseColorTexture": {"index": 0}, "metallicFactor": 0},
                "extensions": {"KHR_materials_unlit": {}},
            },
            {
                "name": "LaniakeaClusters",
                "pbrMetallicRoughness": {"metallicFactor": 0},
                "extensions": {"KHR_materials_unlit": {}},
            },
        ],
        "samplers": nebula["samplers"],
        "images": [{"bufferView": png_view, "mimeType": "image/png"}],
        "textures": [{"sampler": 0, "source": 0}],
    }
    builder.write(OUT_GLB, gltf)

    print(f"Cúmulos: {', '.join(c['id'] for c in clusters)}")
    print(f"Nebulosa: radios {[round(s['radius'] * shell_scale) for s in shells]}  ({sum(len(s['pos']) for s in shells)} vértices)")
    print(f"Nube: {len(positions)} puntos")
    for cid, count in stats:
        print(f"  {cid:>7}: {count:6d} puntos")
    print(f"BBox nube: {positions.min(axis=0).round(1)} -> {positions.max(axis=0).round(1)}")
    print(f"Escrito {OUT_GLB.name}: {OUT_GLB.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
