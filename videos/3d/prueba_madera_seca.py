"""Escena de prueba 3D: viga en corte con galerías, tarugo e inyección (termita de madera seca).
Uso: python3 prueba_madera_seca.py salida.png [muestras]"""
import bpy, bmesh, math, random, sys
from mathutils import Vector
out = sys.argv[1]; samples = int(sys.argv[2]) if len(sys.argv) > 2 else 96
random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene
S.render.engine = 'CYCLES'; S.cycles.device = 'CPU'; S.cycles.samples = samples; S.cycles.use_denoising = True
S.render.resolution_x, S.render.resolution_y = 1080, 1920
import os; S.render.resolution_percentage = int(os.environ.get('PCT', 100))
S.view_settings.view_transform = 'AgX'; S.view_settings.look = 'AgX - Medium High Contrast'

def mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    return m, m.node_tree.nodes, m.node_tree.links, m.node_tree.nodes['Principled BSDF']

def madera():
    m, N, L, B = mat('madera')
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (0.35, 1, 1); mp.inputs['Location'].default_value = (0, 0.21, -0.33)
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3; nz.inputs['Detail'].default_value = 6
    mix = N.new('ShaderNodeMixRGB'); mix.inputs[0].default_value = 0.11
    wv = N.new('ShaderNodeTexWave'); wv.wave_type = 'RINGS'; wv.rings_direction = 'X'
    wv.inputs['Scale'].default_value = 55; wv.inputs['Distortion'].default_value = 5
    wv.inputs['Detail'].default_value = 3; wv.inputs['Detail Scale'].default_value = 2.2
    fn = N.new('ShaderNodeTexNoise'); fn.inputs['Scale'].default_value = 260; fn.inputs['Detail'].default_value = 4
    fmp = N.new('ShaderNodeMapping'); fmp.inputs['Scale'].default_value = (0.03, 1, 1)
    cr = N.new('ShaderNodeValToRGB'); e = cr.color_ramp.elements
    e[0].position = 0.15; e[0].color = (0.46, 0.27, 0.115, 1); e[1].position = 0.9; e[1].color = (0.30, 0.16, 0.06, 1)
    mul = N.new('ShaderNodeMixRGB'); mul.blend_type = 'MULTIPLY'; mul.inputs[0].default_value = 0.45
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.08; bp.inputs['Distance'].default_value = 0.002
    L.new(tc.outputs['Object'], mp.inputs['Vector']); L.new(mp.outputs['Vector'], mix.inputs[1]); L.new(nz.outputs['Color'], mix.inputs[2])
    L.new(mp.outputs['Vector'], nz.inputs['Vector']); L.new(mix.outputs[0], wv.inputs['Vector'])
    L.new(tc.outputs['Object'], fmp.inputs['Vector']); L.new(fmp.outputs['Vector'], fn.inputs['Vector'])
    L.new(wv.outputs['Fac'], cr.inputs['Fac']); L.new(cr.outputs['Color'], mul.inputs[1]); L.new(fn.outputs['Fac'], mul.inputs[2])
    L.new(mul.outputs[0], B.inputs['Base Color']); L.new(wv.outputs['Fac'], bp.inputs['Height']); L.new(bp.outputs['Normal'], B.inputs['Normal'])
    B.inputs['Roughness'].default_value = 0.62
    return m

def simple(name, color, rough=0.4, metal=0.0, trans=0.0, ior=1.45):
    m, N, L, B = mat(name)
    B.inputs['Base Color'].default_value = (*color, 1); B.inputs['Roughness'].default_value = rough
    B.inputs['Metallic'].default_value = metal; B.inputs['Transmission Weight'].default_value = trans; B.inputs['IOR'].default_value = ior
    return m

M_WOOD = madera()
M_LATON = simple('laton', (0.83, 0.62, 0.25), 0.28, 1)
M_ACERO = simple('acero', (0.62, 0.64, 0.66), 0.25, 1)
M_GOMA = simple('goma', (0.02, 0.02, 0.022), 0.55)
M_LIQ = simple('liquido', (0.95, 0.55, 0.08), 0.05, 0, 0.85, 1.36)
M_TERM = simple('termita', (0.70, 0.55, 0.34), 0.4); M_TERM.node_tree.nodes['Principled BSDF'].inputs['Subsurface Weight'].default_value = 0.4
M_CAB = simple('cabeza', (0.55, 0.30, 0.10), 0.3)
M_PISO = simple('piso', (0.045, 0.047, 0.05), 0.5)

def cubo(name, size, loc):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(scale=True); return o
def cil(name, r, h, loc, rot=(0, 0, 0), m=None, v=48):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=v); o = bpy.context.object; o.name = name
    bpy.ops.object.shade_smooth()
    if m: o.data.materials.append(m)
    return o
def tubo(name, pts, m=None, res=10):
    c = bpy.data.curves.new(name, 'CURVE'); c.dimensions = '3D'; c.bevel_depth = 1; c.bevel_resolution = res; c.use_fill_caps = True
    sp = c.splines.new('NURBS'); sp.points.add(len(pts) - 1); sp.use_endpoint_u = True; sp.order_u = 3
    for p, (x, y, z, r) in zip(sp.points, pts): p.co = (x, y, z, 1); p.radius = r
    o = bpy.data.objects.new(name, c); S.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.convert(target='MESH'); o.select_set(False)
    if m: o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = True
    return o
def bool_(a, b, op='DIFFERENCE', borrar=True):
    md = a.modifiers.new('b', 'BOOLEAN'); md.object = b; md.operation = op; md.solver = 'EXACT'
    bpy.context.view_layer.objects.active = a; bpy.ops.object.modifier_apply(modifier=md.name)
    if borrar: bpy.data.objects.remove(b)

# viga 140 x 180 mm, 1,6 m
viga = cubo('viga', (1.6, 0.14, 0.18), (0, 0, 0))
bv = viga.modifiers.new('bv', 'BEVEL'); bv.width = 0.003; bv.segments = 3
bpy.context.view_layer.objects.active = viga; bpy.ops.object.modifier_apply(modifier='bv')

# galerías: siguen la fibra (eje X), con cámaras más anchas
def galeria(x0, z0, largo, escala=1.0):
    pts = []; x = x0; z = z0; n = int(largo / 0.035)
    for i in range(n):
        r = (0.005 + 0.004 * random.random()) * escala
        if random.random() < 0.18: r *= 1.9
        pts.append((x, random.uniform(-0.006, 0.006), z, r))
        x += 0.035; z = max(-0.07, min(0.065, z + random.uniform(-0.012, 0.012)))
    return pts
trazos = [galeria(-0.42, 0.045, 0.62), galeria(-0.30, 0.005, 0.80), galeria(-0.38, -0.04, 0.70),
          galeria(-0.05, 0.03, 0.42), galeria(-0.2, -0.065, 0.45)]
# conexiones verticales entre galerías
for x in (-0.22, 0.02, 0.21, 0.33):
    trazos.append([(x + random.uniform(-.01, .01), 0, z, 0.006) for z in (0.05, 0.02, -0.01, -0.045)])
for i, t in enumerate(trazos):
    bool_(viga, tubo(f'g{i}', t))

# perforación desde arriba hasta 2/3 del espesor (120 mm), Ø 10 mm
XH = 0.02
bool_(viga, cil('perf', 0.005, 0.125, (XH, 0, 0.09 - 0.06), v=32))
# otras perforaciones en zigzag (solo se ven desde arriba)
zig = [(-0.55, 0.03), (-0.33, -0.03), (-0.12, 0.03), (0.30, -0.03), (0.52, 0.03)]
for x, y in zig:
    bool_(viga, cil('p', 0.005, 0.12, (x, y, 0.03), v=32))

# corte: se retira la mitad delantera en un tramo
bool_(viga, cubo('corte', (0.98, 0.2, 0.4), (0.0, -0.1, 0)))
viga.data.materials.clear(); viga.data.materials.append(M_WOOD)
for p in viga.data.polygons: p.use_smooth = False

# líquido: llena la perforación y las galerías cercanas
liq = cil('liq', 0.0046, 0.09, (XH, 0, -0.03 + 0.045 + 0.001), v=32)
for i, t in enumerate(trazos):
    cerca = [(x, y, z, r * 0.93) for (x, y, z, r) in t if abs(x - XH) < 0.11]
    if len(cerca) >= 3:
        tb = tubo(f'l{i}', cerca); bool_(liq, tb, 'UNION')
bool_(liq, cubo('c2', (2, 0.2, 0.4), (0, -0.1, 0)))
liq.data.materials.clear(); liq.data.materials.append(M_LIQ)
for p in liq.data.polygons: p.use_smooth = True

# tarugos de latón con válvula (Ø 10 mm, 35 mm)
def tarugo(x, y, corte=False):
    t = cil('tarugo', 0.0052, 0.035, (x, y, 0.09 - 0.0175 + 0.0005), m=M_LATON)
    for k in range(5):  # estrías
        a = cil('e', 0.0056, 0.0016, (x, y, 0.086 - k * 0.006), m=M_LATON); bool_(t, a, 'UNION')
    cab = cil('cab', 0.0075, 0.003, (x, y, 0.0915), m=M_LATON); bool_(t, cab, 'UNION')
    return t
for x, y in zig: tarugo(x, y)
tarugo(XH, 0)

# boquilla de inyección + manguera
cil('boq1', 0.0065, 0.03, (XH, 0, 0.108), m=M_ACERO)
cil('boq2', 0.010, 0.022, (XH, 0, 0.134), m=M_ACERO, v=6)
cil('boq3', 0.0075, 0.05, (XH, 0, 0.17), m=M_ACERO)
tubo('manguera', [(XH, 0, 0.19, .006), (XH, 0, 0.26, .006), (XH + .03, .02, 0.34, .006), (XH + .14, .08, 0.40, .006),
                  (XH + .30, .16, 0.38, .006), (XH + .45, .3, 0.2, .006), (XH + .5, .5, -0.2, .006)], M_GOMA)

# termitas dentro de las galerías (lejos del líquido y algunas alcanzadas)
def termita(x, z, ang):
    for dx, r, sc, m in ((0, 0.0017, (2.0, 1, 0.9), M_TERM), (0.0042, 0.0013, (1.1, 1, 0.9), M_CAB)):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=16, ring_count=8,
            location=(x + dx * math.cos(ang), -0.0005, z + dx * math.sin(ang)), rotation=(0, -ang, 0))
        o = bpy.context.object; o.scale = sc; bpy.ops.object.shade_smooth(); o.data.materials.append(m)
for t in trazos[:5]:
    for (x, y, z, r) in t:
        if -0.47 < x < 0.47 and random.random() < 0.75:
            for k in range(random.randint(1, 3)):
                termita(x + random.uniform(-.012, .012), z + random.uniform(-r, r) * 0.5, random.uniform(-.5, .5) + random.choice((0, math.pi)))

# piso y fondo
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, -0.5)); bpy.context.object.data.materials.append(M_PISO)
W = bpy.data.worlds.new('w'); S.world = W; W.use_nodes = True
W.node_tree.nodes['Background'].inputs[0].default_value = (0.012, 0.014, 0.018, 1)

def luz(loc, energia, size, color=(1, 1, 1)):
    d = bpy.data.lights.new('l', 'AREA'); d.energy = energia; d.size = size; d.color = color
    o = bpy.data.objects.new('l', d); S.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o
luz((-0.6, -1.0, 0.9), 22, 0.9, (1, 0.93, 0.82))
luz((0.9, -0.5, 0.2), 4, 0.6, (0.75, 0.85, 1))
luz((0.3, 0.8, 0.7), 12, 0.5, (1, 0.8, 0.6))

cam_d = bpy.data.cameras.new('cam'); cam_d.lens = 58
cam = bpy.data.objects.new('cam', cam_d); S.collection.objects.link(cam); S.camera = cam
cam.location = (-0.36, -0.74, 0.36)
obj = Vector((0.0, -0.01, 0.06))
cam.rotation_euler = (obj - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam_d.dof.use_dof = True; cam_d.dof.focus_distance = (obj - cam.location).length; cam_d.dof.aperture_fstop = 5.6
S.render.filepath = out
bpy.ops.wm.save_as_mainfile(filepath=out.replace('.png', '.blend'))
bpy.ops.render.render(write_still=True)
