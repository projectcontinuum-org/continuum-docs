---
sidebar_label: "🧪 Cheminformatics"
sidebar_position: 3
---

# Cheminformatics Nodes

[`continuum-feature-cheminformatics`](https://github.com/projectcontinuum-org/continuum-feature-cheminformatics) ships 38 production-grade cheminformatics nodes across 10 categories, powered by [RDKit](https://www.rdkit.org/). Built for computational chemistry, medicinal chemistry, and drug discovery teams who need scalable, reproducible molecular processing pipelines — parse, standardize, fingerprint, filter, react, and visualize molecules at scale.

<Badges>
  <Badge color="green">38 nodes</Badge>
  <Badge color="pink">10 categories</Badge>
  <Badge color="blue">Powered by RDKit</Badge>
</Badges>

## Node categories

| Category | Example nodes |
|----------|----------------|
| Calculators | Calculate Charges, Descriptor Calculation (up to 41 descriptors) |
| Converters | Canonical SMILES, InChI ↔ Molecule, Molecule Writer, SMILES Parser |
| Experimental | Molecule Catalog Filter (PAINS/BRENK/NIH/ZINC), R-Group Decomposition, Structure Normalizer |
| Fingerprints | Fingerprint (9 algorithms), Count-Based Fingerprint, Fingerprint Similarity, Diversity Picker |
| Fragments | Molecule Fragmenter, Molecule Extractor, Murcko Scaffold |
| Geometry | Add Conformers, Add Coordinates, Optimize Geometry (MMFF94/UFF), Open 3D Alignment, RMSD Filter |
| Modifiers | Add/Remove Hydrogens, Aromatize, Kekulize, Salt Stripper |
| Reactions | Chemical Transformation, One/Two Component Reaction (SMARTS-based) |
| Rendering | RDKit to SVG |
| Searching | Substructure Filter/Counter, Functional Group Filter, Maximum Common Substructure |

Plus a **Testing** node (SDF Difference Checker) for validating molecular data pipelines.

## Fingerprint algorithms

| Algorithm | Type | Typical use case |
|-----------|------|-------------------|
| Morgan (ECFP) | Circular | General-purpose similarity, QSAR, virtual screening |
| FeatMorgan (FCFP) | Circular (pharmacophoric) | Pharmacophore-aware similarity |
| AtomPair | Topological | Scaffold hopping, diversity analysis |
| Torsion | Topological | Conformational similarity |
| RDKit | Path-based | Substructure-oriented similarity |
| Avalon | Substructure | Fast screening, patent searching |
| Layered | Path-based (layered) | Similarity with tunable abstraction layers |
| MACCS | Structural keys (166-bit) | Quick pharmacophore screening |
| Pattern | Substructure | Substructure matching fingerprints |

## Molecular descriptors (41 available)

Physicochemical (AMW, SlogP, TPSA...), hydrogen bonding, structural counts, stereochemistry, ring systems, complexity, connectivity (Chi), and shape (Kier) descriptors — all computable in a single node pass.

## Structural alert catalogs

The Molecule Catalog Filter node screens compounds against **PAINS** (assay interference), **BRENK** (unstable/reactive motifs), **NIH** (MLSMR exclusion filters), and **ZINC** (drug-likeness filters).

## Example pipeline pattern

```
SMILES Parser --> Salt Stripper --> Structure Normalizer --> Canonical SMILES --> Descriptor Calculation
```

A typical compound library standardization pipeline: parse raw structures, strip salts, normalize, canonicalize, then compute descriptors — each step a versioned, reconfigurable node.

See the [`continuum-feature-cheminformatics` README](https://github.com/projectcontinuum-org/continuum-feature-cheminformatics) for the full node reference and more pipeline patterns (hit triage, virtual screening, 3D modeling prep).
