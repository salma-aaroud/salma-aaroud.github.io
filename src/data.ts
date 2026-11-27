// All content for the site. Every figure here comes from Salma's existing portfolio copy.

export const PROFILE = {
  name: 'Salma Aaroud',
  role: 'Aeronautical Engineer',
  focus: 'CFD · Compressible flows · Airworthiness',
  email: 'salma.aaroud@mail.polimi.it',
  linkedin: 'https://www.linkedin.com/in/salma-aaroud/',
  linkedinLabel: 'linkedin.com/in/salma-aaroud',
  location: 'Milan, Italy',
  status: 'MSc Politecnico di Milano · graduating December 2026',
};

export type Metric = { value: number; decimals?: number; prefix?: string; suffix: string; label: string; note: string };

export const METRICS: Metric[] = [
  { value: 0.11, decimals: 2, suffix: ' mm', label: 'Validation error', note: 'Shock position vs published supersonic-jet cases' },
  { value: 4.7, decimals: 1, suffix: '%', label: 'Drag vs wind tunnel', note: 'URANS rear-wing set-up vs PoliMi test data' },
  { value: 381, suffix: '', label: 'In-service defects', note: 'Reliability study: Pareto, MTBF, MTTR' },
  { value: 5, suffix: ' aircraft', label: 'CofA renewals', note: 'Royal Air Maroc · Sarah Airways' },
  { value: 75, prefix: '+', suffix: '%', label: 'Mach disk growth', note: 'Thesis finding with stronger non-ideality' },
  { value: 10, suffix: ' levels', label: 'Mesh adaptation', note: 'Anisotropic refinement on an HPC cluster' },
];

export const THESIS = {
  title: 'Numerical Investigation of Planar and Axisymmetric Underexpanded Jets in Ideal and Non-Ideal Compressible Flows',
  short: 'Supersonic jets of a non-ideal gas',
  school: 'MSc Aeronautical Engineering · Politecnico di Milano',
  steps: [
    {
      k: '01',
      h: 'The question',
      p: 'When a gas leaves a nozzle at higher pressure than its surroundings, it forms a chain of shock cells. What happens to that structure when the gas is siloxane MM, a dense organic vapour used in ORC turbines, where the ideal-gas law no longer holds?',
      npr: 3.2, gas: 'n2' as const,
    },
    {
      k: '02',
      h: 'The method',
      p: 'Planar and round jets of nitrogen and MM, solved in SU2 with Euler, RANS (k–ω SST) and unsteady RANS, a Peng–Robinson real-gas model and ten levels of anisotropic mesh adaptation, run as batch jobs on an SGE/MPI cluster and post-processed in Python.',
      npr: 5.2, gas: 'n2' as const,
    },
    {
      k: '03',
      h: 'The check',
      p: 'Nothing counted until it was verified: grid convergence and domain independence studies first, then a match within 0.11 mm of published jet cases.',
      npr: 5.6, gas: 'n2' as const,
    },
    {
      k: '04',
      h: 'The finding',
      p: 'Stronger non-ideality grows the Mach disk radius by up to 75%, and the first shock cell of a planar jet sits 2.5–4.1× farther downstream than the Mach disk of a round jet.',
      npr: 5.6, gas: 'mm' as const,
    },
  ],
  numbers: [
    ['0.11 mm', 'match to published jet cases'],
    ['2.5–4.1×', 'planar first shock cell vs round Mach disk, downstream distance'],
    ['+75%', 'Mach disk radius with stronger non-ideality'],
    ['10', 'levels of anisotropic mesh adaptation'],
  ] as [string, string][],
};

export type Project = {
  id: string;
  title: string;
  kicker: string;
  cat: ('cfd' | 'exp' | 'ctrl' | 'ops')[];
  team: string;
  summary: string;
  role: string;
  method: string[];
  result: string;
  stat: [string, string];
  tools: string[];
  img?: string;
  imgAlt?: string;
  imgFit?: 'cover' | 'contain';
  cmap?: 'turbo' | 'coolwarm';
  gallery?: { src: string; alt: string; cap: string }[];
  skills: string[];
};

export const PROJECTS: Project[] = [
  {
    id: 'solar',
    cmap: 'turbo',
    title: 'Solar car aerodynamics, CFD to wind tunnel',
    kicker: 'External aerodynamics · Validation',
    cat: ['cfd', 'exp'],
    team: 'Team of 4 · PoliMi',
    summary: 'Four World Solar Challenge designs compared with RANS CFD on 7–8.5 M-cell meshes, then tested on a 3D-printed model in the PoliMi wind tunnel.',
    role: 'Owned the grid convergence study and built the 16 cm 3D-printed model: printed, prepared and sanded for the force balance.',
    method: [
      'RANS (k–ω SST) in OpenFOAM on 7–8.5 M-cell meshes',
      'Grid convergence study before comparing designs',
      'Vortex and wake structures to explain where the drag comes from',
      'Force-balance testing of a printed scale model, including ground effect',
    ],
    result: 'CFD drag coefficient 0.144 against 0.163 measured. Close to the ground, drag rose 2.4 times.',
    stat: ['Cd 0.144 / 0.163', 'CFD vs wind tunnel'],
    tools: ['OpenFOAM', 'SOLIDWORKS', 'ParaView', 'Python', '3D printing'],
    img: '/img/car_cp.webp',
    imgAlt: 'Pressure coefficient on a solar car body',
    gallery: [
      { src: '/img/car_cp.webp', alt: 'Pressure coefficient on a solar car', cap: 'Surface pressure coefficient, RANS' },
      { src: '/img/car_vortex.webp', alt: 'Vortex structures behind a solar car', cap: 'Wake vortex structures' },
      { src: '/img/car_tunnel.webp', alt: '3D-printed model on the wind-tunnel force balance', cap: 'The 16 cm model on the PoliMi force balance' },
    ],
    skills: ['cfd', 'openfoam', 'aero', 'cad', 'python', 'valid'],
  },
  {
    id: 'drs',
    cmap: 'coolwarm',
    title: '2D DRS rear wing',
    kicker: 'Motorsport aerodynamics · URANS',
    cat: ['cfd'],
    team: 'Team of 5 · PoliMi',
    summary: '24 mainplane and flap combinations with the DRS open, solved with Euler and unsteady RANS and checked against wind-tunnel drag.',
    role: 'Set up and ran the SU2 cases and compared them with experimental data.',
    method: [
      'Meshing in Gmsh for 24 geometry combinations',
      'Euler for screening, URANS for the separated flow',
      'Validation of the RANS set-up against wind-tunnel drag',
    ],
    result: 'RANS set-up within 4.7% of wind-tunnel drag.',
    stat: ['4.7%', 'drag error vs wind tunnel'],
    tools: ['SU2', 'Gmsh', 'URANS', 'ParaView'],
    img: '/img/drs_mach.webp',
    imgAlt: 'Mach field around a rear wing with DRS open',
    skills: ['cfd', 'su2', 'aero', 'valid'],
  },
  {
    id: 'air',
    title: 'Airworthiness & reliability',
    kicker: 'Continuing airworthiness · Internships',
    cat: ['ops'],
    team: 'Royal Air Maroc · Sarah Airways',
    summary: 'Certificate of airworthiness renewals for five aircraft, FAA and EASA AD/SB studies, and a reliability analysis of 381 in-service defects.',
    role: 'Airworthiness intern: applicability and compliance records for ADs and SBs, and the defect study end to end.',
    method: [
      'CofA renewal packages for five aircraft',
      'FAA and EASA airworthiness directive and service bulletin applicability',
      'Pareto, MTBF and MTTR analysis of 381 in-service defects',
    ],
    result: 'Five aircraft renewed; a defect ranking the maintenance team could act on.',
    stat: ['381', 'defects analysed'],
    tools: ['FAA / EASA ADs', 'Service bulletins', 'Excel', 'Reliability'],
    skills: ['air'],
  },
  {
    id: 'drone',
    title: 'Robust drone control',
    kicker: 'Flight dynamics · Control',
    cat: ['ctrl'],
    team: 'Team of 3 · PoliMi',
    summary: 'Lateral control of a multirotor by dynamic inversion and H∞ mixed sensitivity, with robustness checked over 1,000 Monte Carlo runs.',
    role: 'Controller design and the Monte Carlo robustness campaign.',
    method: [
      'Dynamic inversion inner loop',
      'H∞ mixed-sensitivity synthesis',
      '1,000-run Monte Carlo on uncertain parameters',
    ],
    result: 'A controller whose robustness was demonstrated statistically, not just nominally.',
    stat: ['1,000', 'Monte Carlo runs'],
    tools: ['MATLAB', 'Simulink', 'Monte Carlo'],
    skills: ['matlab', 'stats'],
  },
];

export const JOURNEY = [
  {
    code: 'NKG', when: '2017 – 2021', place: 'Nanjing, China',
    title: 'Engineering in a new language',
    text: 'BSc in Aeronautical Engineering at NUAA, taught in Chinese and English, with a full machine-design project and CNC workshop training.',
    wins: ['GPA 4.0 / 5', 'Aeroengines 96/100', 'Numerical analysis 96/100'],
  },
  {
    code: 'CMN', when: '2021 – 2023', place: 'Casablanca, Morocco',
    title: 'Hands on real aircraft',
    text: 'Airworthiness internships at Royal Air Maroc and Sarah Airways: certificate of airworthiness renewals, FAA and EASA AD/SB applicability studies and a reliability analysis of in-service defects.',
    wins: ['5 aircraft CofA renewals', '381 defects analysed', 'FAA & EASA ADs / SBs'],
  },
  {
    code: 'MIL', when: '2023 – 2026', place: 'Milan, Italy',
    title: 'Learning to see the flow',
    text: 'MSc in Aeronautical Engineering at Politecnico di Milano: CFD, compressible and multiphase flows, and a thesis on supersonic jets of non-ideal gases.',
    wins: ['Multiphase flows 30/30', 'Thesis: non-ideal supersonic jets', 'Robust flight control'],
  },
  {
    code: 'NEXT', when: '2027 →', place: 'Europe · open to relocation',
    title: 'My first full-time role',
    text: 'CFD and aerodynamics, propulsion and compressible flow, or airworthiness and continuing-airworthiness engineering.',
    wins: ['Available from early 2027'],
  },
];

export const SKILLS: { id: string; name: string; where: string; now?: boolean }[] = [
  { id: 'su2', name: 'SU2', where: 'Thesis jets and DRS rear wing', now: true },
  { id: 'openfoam', name: 'OpenFOAM', where: 'Solar car aerodynamics and wake study' },
  { id: 'cfd', name: 'CFD (RANS / URANS / Euler)', where: 'Thesis, DRS wing, solar cars', now: true },
  { id: 'mesh', name: 'Gmsh · adaptive meshing', where: 'Ten adaptation levels in the thesis; DRS meshes', now: true },
  { id: 'python', name: 'Python', where: 'Thesis automation and post-processing, data analysis', now: true },
  { id: 'hpc', name: 'Linux / HPC · Bash · MPI', where: 'Thesis batch runs on an SGE/MPI cluster', now: true },
  { id: 'paraview', name: 'ParaView', where: 'Every CFD project', now: true },
  { id: 'valid', name: 'Validation', where: '0.11 mm on jets, 4.7% on DRS drag, CFD vs tunnel on the solar car' },
  { id: 'aero', name: 'Aerodynamics', where: 'Solar cars, DRS wing, panel-method solver' },
  { id: 'matlab', name: 'MATLAB / Simulink', where: 'Drone control, panel-method solver, B767 aeroelastic design' },
  { id: 'stats', name: 'Monte Carlo', where: '1,000-run robustness check of the drone controller' },
  { id: 'cad', name: 'SOLIDWORKS · CATIA · AutoCAD', where: 'Solar car models, BSc machine-design project' },
  { id: 'air', name: 'Airworthiness (FAA / EASA)', where: 'Royal Air Maroc and Sarah Airways internships' },
  { id: 'comp', name: 'Compressible / real-gas flow', where: 'Peng–Robinson MM jets in the thesis' },
];

// Fit checker: regex → [skill, evidence]
export const HAVE: [RegExp, string, string][] = [
  [/\bcfd\b|computational fluid/i, 'CFD', 'Thesis, DRS wing, solar cars'],
  [/\bsu2\b/i, 'SU2', 'Thesis and DRS wing'],
  [/openfoam/i, 'OpenFOAM', 'Solar car study'],
  [/\brans\b|turbulen|k-?ω|k-?omega|\bsst\b/i, 'RANS / turbulence models', 'k–ω SST in thesis, DRS and solar car'],
  [/urans|unsteady|transient/i, 'Unsteady simulation', 'URANS in thesis and DRS'],
  [/\bmesh|meshing|\bgrid/i, 'Meshing', 'Gmsh, snappyHexMesh, adaptive refinement'],
  [/python/i, 'Python', 'Thesis automation and post-processing'],
  [/matlab|simulink/i, 'MATLAB / Simulink', 'Drone control, panel solver'],
  [/linux|\bhpc\b|cluster|bash/i, 'Linux / HPC', 'Thesis batch jobs (SGE, MPI)'],
  [/paraview|post-?process/i, 'Post-processing', 'ParaView and Python'],
  [/aerodynam/i, 'Aerodynamics', 'Solar cars, DRS wing'],
  [/compressib|supersonic|transonic/i, 'Compressible flow', 'Thesis on supersonic jets'],
  [/thermodynam|thermo-?fluid|heat transfer|real gas/i, 'Thermo-fluid dynamics', 'Real-gas (Peng–Robinson) thesis work'],
  [/multiphase|two-phase|free surface/i, 'Multiphase flows', 'Course grade 30/30'],
  [/wind tunnel|validat|experiment/i, 'Validation and testing', 'Wind tunnel and published data'],
  [/airworthiness/i, 'Airworthiness', 'Sarah Airways, Royal Air Maroc'],
  [/airworthiness directive|service bulletin/i, 'ADs and SBs', 'FAA and EASA AD/SB applicability, compliance records'],
  [/maintenance/i, 'Maintenance engineering', 'Work packages, records, reliability'],
  [/reliab|mtbf|mttr/i, 'Reliability', '381-defect study: Pareto, MTBF, MTTR'],
  [/technical document|manuals?\b|publications|technical report/i, 'Technical documentation', 'Manuals, AD/SB studies, reports'],
  [/solidworks|\bcad\b|catia|autocad|drawing/i, 'CAD and drawings', 'SOLIDWORKS, AutoCAD, CATIA (basic)'],
  [/excel|office|powerpoint/i, 'Microsoft Office', 'Reports, reliability analysis'],
  [/monte carlo|statistic|uncertaint/i, 'Monte Carlo / statistics', 'Drone robustness study'],
  [/optimi[sz]|operations research/i, 'Optimisation', 'Operations Research coursework'],
  [/english/i, 'English', 'Fluent'],
  [/french/i, 'French', 'Fluent'],
  [/italian/i, 'Italian', 'B2'],
  [/arabic/i, 'Arabic', 'Fluent'],
  [/spanish/i, 'Spanish', 'Intermediate'],
];

export const GAPS: [RegExp, string][] = [
  [/ansys|fluent\b(?!\s+(english|italian|french))/i, 'ANSYS Fluent'],
  [/star-?ccm/i, 'STAR-CCM+'],
  [/abaqus/i, 'Abaqus'],
  [/nastran|patran/i, 'Nastran'],
  [/c\+\+/i, 'C++'],
  [/\bjava\b/i, 'Java'],
  [/\bsap\b/i, 'SAP'],
  [/\bplc\b|tia portal|wincc/i, 'PLC programming'],
  [/ls-?dyna/i, 'LS-DYNA'],
  [/simcenter|amesim/i, 'Simcenter / Amesim'],
  [/machine learning|neural/i, 'Machine learning'],
  [/part[- ]?145|part[- ]?m\b|part[- ]?66|\bcamo\b/i, 'EASA Part-M / 145 / CAMO'],
];

export const FIT_EXAMPLE =
  'CFD Engineer – Aerospace. Requirements: MSc in Aerospace Engineering; experience with CFD (RANS, URANS), meshing and post-processing; knowledge of compressible flows and thermodynamics; Python scripting on Linux/HPC clusters; ANSYS or STAR-CCM+ is a plus; validation against wind-tunnel tests; English required, Italian appreciated.';

export const DRAFTS: Record<string, [string, string]> = {
  job: ['An engineering role', "Hello Salma,\nI'm [name] from [company]. We have an opening for a [role] in [city] and your profile caught our attention. Could you send us your CV?\nBest regards,"],
  talk: ['A first call about my team', "Hello Salma,\nI'm [name], [role] at [company]. I'd be happy to have a short call about our team and how you could fit in. When would suit you?\nBest regards,"],
  thesis: ['Your thesis or data', "Hello Salma,\nI'm [name] from [company]. I'd like to read your thesis on underexpanded non-ideal jets. Could you send it, or walk me through it?\nBest regards,"],
};
