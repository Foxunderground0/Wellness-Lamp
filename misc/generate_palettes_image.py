import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import textwrap

PRESET_PALETTES = [
    {
        'name': 'Golden Hour',
        'tagline': "Bathed in the day's last gold",
        'colors': ['#ff9a56','#ffbd70','#ffd488','#ffaa66','#ff8c55','#ffc87a','#ffdb99','#ffa070'],
    },
    {
        'name': 'Deep Night',
        'tagline': 'Still and vast as the night sky',
        'colors': ['#1a1a4e','#2d2d7e','#3d3580','#1e2a5a','#2a1a5e','#363680','#222255','#3a3a70'],
    },
    {
        'name': 'Ocean Drift',
        'tagline': 'Carried softly by the current',
        'colors': ['#48c9b0','#52d9c8','#76e4d8','#3ab5a0','#5ec9d4','#7ed8e8','#a0e8e0','#60ccd0'],
    },
    {
        'name': 'Rose Garden',
        'tagline': 'Soft petals in still morning air',
        'colors': ['#f4a0b5','#f7c0cb','#f9d4dc','#f0909a','#f5b0c0','#fad4d4','#fce8e8','#f2a8b8'],
    },
    {
        'name': 'Storm Calm',
        'tagline': 'Holding still through the grey',
        'colors': ['#7890a8','#8898b8','#9aaac8','#607088','#788898','#aab8c8','#c0ccd8','#8898a8'],
    },
    {
        'name': 'Forest Floor',
        'tagline': 'Roots deep, breathing slow',
        'colors': ['#5d8a60','#4a7050','#78a468','#3d6040','#6a9458','#8ab878','#a0c890','#607850'],
    },
    {
        'name': 'Candy Dream',
        'tagline': 'Sweet colours, lighter than air',
        'colors': ['#ff8fd8','#ffa0c8','#c88fff','#ffb0e8','#a0b8ff','#ffd0f0','#d0a0ff','#ffb8d8'],
    },
    {
        'name': 'Ember Glow',
        'tagline': 'Warmth that lingers long after',
        'colors': ['#d44020','#e86030','#f08048','#c03818','#e05028','#f0a060','#f8c080','#e07040'],
    },
]

FEELING_PALETTES = [
    {
        'name': 'Alive and Reaching',
        'tagline': 'The kind of day that moves on its own',
        'colors': ['#FF6200','#FFD700','#FF2800','#FF9900','#FFE500','#FF4400','#FFB800','#FF3A00'],
    },
    {
        'name': 'Warm and Wide Open',
        'tagline': 'Arms out to whatever comes next',
        'colors': ['#FFB300','#FF5500','#FFE000','#FF4400','#FFC800','#FF7700','#FFD800','#FF6800'],
    },
    {
        'name': 'Grateful Golden Hour',
        'tagline': 'Full in a way that needs no explanation',
        'colors': ['#FFD000','#FF4400','#FFE900','#FF8800','#FFB800','#FF2200','#FFC500','#FF6600'],
    },
    {
        'name': 'Morning Resolve',
        'tagline': 'Facing what needs to be faced',
        'colors': ['#FF4433','#FF0066','#FF7722','#FF0044','#FF5500','#FF3399','#FF6600','#FF00BB'],
    },
    {
        'name': 'Purposeful Drive',
        'tagline': 'Moving with intention today',
        'colors': ['#00DDFF','#0055EE','#00FFEE','#0033CC','#00BBDD','#0077FF','#00EEDD','#0044DD'],
    },
    {
        'name': 'Forest Floor Peace',
        'tagline': 'Roots deep, breathing slow',
        'colors': ['#00EE44','#88DD00','#00FF55','#AAEE00','#00CC33','#99CC00','#00FF44','#77BB00'],
    },
    {
        'name': 'Deep Night Calm',
        'tagline': 'When the world goes quiet and thoughts go deep',
        'colors': ['#5500FF','#2200DD','#7700FF','#0033BB','#6600EE','#3311CC','#8800FF','#0044CC'],
    },
    {
        'name': 'Tender and Low Key',
        'tagline': 'Soft around the edges today',
        'colors': ['#00CC77','#0088EE','#00EE99','#00AAFF','#00BB66','#0099DD','#00FF88','#0077CC'],
    },
    {
        'name': 'Healing Quiet',
        'tagline': 'Something is mending that you cannot see',
        'colors': ['#FF0077','#9900FF','#FF0055','#7700EE','#FF0088','#00DDAA','#EE0066','#8800FF'],
    },
    {
        'name': 'Sunday Afternoon Ease',
        'tagline': 'The hours that belong to you',
        'colors': ['#BB00FF','#FF0066','#9900EE','#0099FF','#CC00FF','#FF0044','#AA00DD','#0088EE'],
    },
    {
        'name': 'Quiet Inner Distance',
        'tagline': 'Something stays just out of reach',
        'colors': ['#0044CC','#4400EE','#0066DD','#5500FF','#0033BB','#3300DD','#0055EE','#6600EE'],
    },
    {
        'name': 'Missing Someone Softly',
        'tagline': 'The space where someone used to be',
        'colors': ['#8800FF','#FF00AA','#6600EE','#0033FF','#AA00FF','#EE00BB','#7700DD','#0055EE'],
    },
    {
        'name': 'Bittersweet and Still',
        'tagline': 'Missing something you cannot name',
        'colors': ['#FF0044','#9900FF','#FF2266','#6600EE','#FF0033','#FFD700','#EE0055','#7700FF'],
    },
    {
        'name': 'Nostalgic Haze',
        'tagline': 'Faded gold and old photographs',
        'colors': ['#FF8800','#FF0088','#FFAA00','#EE0077','#FF7700','#FF0066','#FFB800','#DD0055'],
    },
    {
        'name': 'Introspective Blue',
        'tagline': 'Going somewhere deep and quiet inside',
        'colors': ['#0055FF','#5500EE','#0033EE','#4400DD','#0044CC','#3300CC','#0066FF','#6600FF'],
    },
    {
        'name': 'Heavy and Far Away',
        'tagline': 'The weight settles in uninvited',
        'colors': ['#2200AA','#003388','#3300CC','#004499','#2200BB','#005577','#330099','#003366'],
    },
    {
        'name': 'Gently Drifting Along',
        'tagline': 'Not quite here, not quite there',
        'colors': ['#00EEFF','#0066EE','#00DDDD','#0055DD','#00CCEE','#0077FF','#00BBCC','#0044CC'],
    },
    {
        'name': 'Sharp and Buzzing',
        'tagline': 'Too much going on inside right now',
        'colors': ['#00FFEE','#FFEE00','#00EEDD','#FFCC00','#00FFCC','#FFD700','#00DDCC','#FFB800'],
    },
    {
        'name': 'Creative Fire',
        'tagline': 'The deep purple of ideas burning clean',
        'colors': ['#BB00FF','#00FFDD','#FF00AA','#8800EE','#00DDFF','#FF0088','#CC00FF','#00CCFF'],
    },
    {
        'name': 'Anxious Edge',
        'tagline': 'Too fast and cannot find the brake',
        'colors': ['#99FF00','#FF0088','#BBEE00','#EE0077','#AAFF00','#FF0066','#88EE00','#DD0055'],
    },
    {
        'name': 'Restless Ember Energy',
        'tagline': 'Moving fast to outrun the thinking',
        'colors': ['#FF2200','#FFD700','#FF4400','#FFBB00','#EE1100','#FFA800','#FF3300','#FFE000'],
    },
    {
        'name': 'Scattered Energy',
        'tagline': 'Everything at once and none of it clearly',
        'colors': ['#FF0000','#0055FF','#FFE000','#EE0000','#0044EE','#FFCC00','#FF1100','#0066FF'],
    },
    {
        'name': 'Social Warmth',
        'tagline': 'Warmth that comes from being with people',
        'colors': ['#FF0055','#FF7700','#FF0077','#FF8800','#EE0044','#FF6600','#FF0066','#FF9900'],
    },
    {
        'name': 'Cozy Shelter',
        'tagline': 'Warm inside, quiet outside',
        'colors': ['#FF8C00','#CC3300','#FFAA00','#BB2200','#FF9900','#DD4400','#FFB800','#EE5500'],
    },
    {
        'name': 'Quietly In Between',
        'tagline': 'Neither here nor pulling away',
        'colors': ['#0099CC','#6600AA','#00AABB','#7700BB','#0088BB','#5500AA','#00BBCC','#8800CC'],
    },
]


def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4))


def luminance(hex_color):
    r, g, b = hex_to_rgb(hex_color)
    return 0.299 * r + 0.587 * g + 0.114 * b


def draw_palette_card(ax, palette, section_label=None):
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    bg = '#1a1a1a'
    ax.add_patch(patches.FancyBboxPatch((0.01, 0.01), 0.98, 0.98,
        boxstyle='round,pad=0.02', facecolor=bg, edgecolor='#333333', linewidth=0.5))

    # Palette name
    ax.text(0.5, 0.90, palette['name'], ha='center', va='center',
            fontsize=13, fontweight='bold', color='white',
            wrap=True, transform=ax.transAxes)

    # Catch phrase
    phrase = textwrap.fill(palette['tagline'], width=26)
    ax.text(0.5, 0.78, phrase, ha='center', va='center',
            fontsize=9.5, color='#bbbbbb', style='italic',
            transform=ax.transAxes, multialignment='center')

    # Color swatches
    colors = palette['colors']
    n = len(colors)
    swatch_w = 0.96 / n
    swatch_h = 0.26
    swatch_y = 0.33

    for i, c in enumerate(colors):
        x = 0.02 + i * swatch_w
        ax.add_patch(patches.Rectangle((x, swatch_y), swatch_w * 0.90, swatch_h,
            facecolor=c, edgecolor='none', transform=ax.transAxes))

    # Hex codes under swatches
    for i, c in enumerate(colors):
        x = 0.02 + i * swatch_w + swatch_w * 0.45
        ax.text(x, swatch_y - 0.04, c.upper(), ha='center', va='top',
                fontsize=6.0, color='#999999', transform=ax.transAxes,
                rotation=90)


def make_grid(palettes, title, filename, cols=4):
    n = len(palettes)
    rows = (n + cols - 1) // cols
    fig_w = cols * 5.5
    fig_h = rows * 4.0 + 1.0

    fig, axes = plt.subplots(rows, cols, figsize=(fig_w, fig_h))
    fig.patch.set_facecolor('#111111')
    fig.suptitle(title, fontsize=22, fontweight='bold', color='white', y=0.98)

    axes_flat = axes.flatten() if rows > 1 else (axes if cols > 1 else [axes])

    for i, palette in enumerate(palettes):
        draw_palette_card(axes_flat[i], palette)

    for j in range(len(palettes), len(axes_flat)):
        axes_flat[j].axis('off')

    plt.tight_layout(rect=[0, 0, 1, 0.96])
    plt.savefig(filename, dpi=220, bbox_inches='tight', facecolor='#111111')
    plt.close()
    print(f'Saved: {filename}')


make_grid(PRESET_PALETTES, 'Preset Palettes', '/Users/umer/Documents/WellnessLampNCA/preset_palettes.png')
make_grid(FEELING_PALETTES, 'Feeling Palettes (Mood Archetypes)', '/Users/umer/Documents/WellnessLampNCA/feeling_palettes.png', cols=5)
