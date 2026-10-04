# Dining Table Clearance Modeller

A small browser-local worksheet for modelling the space remaining around a rectangular dining table. Enter room dimensions, the table position and the chair extents you measured. The tool draws the resulting rectangular envelope and lets you keep a CSV or printed measurement record.

Published by the WEHOMZ retail team and prepared with AI assistance. This is a geometry tool, with no recommended clearance threshold, safety rating or professional design certification.

## Run locally

Keep these three files together:

| File | Purpose |
|---|---|
| `index.html` | Measurement form, diagram, formulas and record controls |
| `style.css` | Responsive screen layout and print styles |
| `app.js` | Input validation, calculations, unit conversion and CSV generation |

1. Download the three files into one folder.
2. Open `index.html` in a current browser with JavaScript enabled.
3. Choose centimetres or inches, then replace the illustrative values with your measurements.

There is no installation, build step, external library, server or account requirement. No deployment configuration is included.

## Take and enter measurements

1. Pick one room orientation: **width** runs left to right, and **depth** runs top to bottom. Keep that orientation throughout.
2. Enter the room width and depth, then the rectangular table width and depth. All four must be greater than zero.
3. Enter the distance from the left room boundary to the left table edge, and from the top room boundary to the top table edge. Offsets must be zero or positive.
4. At each table edge, measure outward to the furthest chair position you want to represent. Enter left, right, top and bottom extents. Use zero for an unused edge. Extents must be zero or positive.
5. Check **I have replaced the example values with my measurements** only when that statement is true. Otherwise the exported record remains labelled as unconfirmed or illustrative.
6. Read all four remaining distances. A negative result means the rectangular envelope crosses that named boundary; a positive result is the remaining distance in this model. Zero represents contact with the boundary at the model's numeric precision.
7. Use **Download CSV** or **Print / save PDF** to keep the inputs, results, measurement-source label and scope together. PDF saving uses the browser's print dialog.

**Restore illustrative example** resets the measurements and removes the confirmation. The starting values are examples, not measurements of a recommended room or furniture arrangement.

## Calculations

All calculations use stored centimetres. One inch is 2.54 centimetres. Switching display units retains the stored measurements; editing an input changes that field only.

Let:

- `W`, `D`: room width and depth;
- `w`, `d`: table width and depth;
- `x`, `y`: table offsets from the left and top room boundaries;
- `L`, `R`, `T`, `B`: measured outward chair extents at the four table edges.

| Result | Formula |
|---|---|
| Left remaining | `x − L` |
| Right remaining | `W − x − w − R` |
| Top remaining | `y − T` |
| Bottom remaining | `D − y − d − B` |
| Envelope left / top | `x − L`, `y − T` |
| Envelope width / depth | `w + L + R`, `d + T + B` |

### Reproducible example

Use centimetres: room `300 × 250`, table `160 × 80`, left/top offsets `60, 80`, and left/right/top/bottom extents `70, 65, 40, 50`.

The remaining distances are **left −10, right 15, top 40 and bottom 40 cm**. The entered left extent crosses the left boundary by 10 cm. These are illustrative inputs for checking the calculation, not recommended dimensions.

Display values normally round to three decimal places. Very small nonzero input values retain additional digits rather than rounding to zero. CSV records include the full stored centimetre values and their values in the chosen display unit. Floating-point comparisons treat distances within `1e-9` centimetres of zero as touching the boundary in the displayed classification.

## Model boundaries

- The room and table are axis-aligned rectangles. The four extents are combined into one rectangular envelope.
- Individual chair shapes, curved edges, corners, rotation, door swings, routes, obstacles and movement are not modelled.
- No chair or clearance dimensions are inferred from a product name. Measure the actual item variant and the positions you want to represent.
- The result does not assess accessibility, fire escape, ergonomics, building requirements or safe passage. Check those requirements separately.
- Empty, negative or non-finite inputs are rejected where applicable. Values outside the finite drawing range pause the model and disable printing and CSV export until corrected.

When comparing a piece from the [WEHOMZ furniture collection](https://wehomzfurn.com/collections/furniture), use that exact item's dimensions in the model and check its real shape and movement separately.

## Data and export

The tool has no analytics, remote fonts, cookies, form submission, database or connector. Measurements remain in page memory. Reloading restores the illustrative defaults; they are not saved between sessions. CSV generation happens locally, and printing is handled by the browser. Following the furniture link leaves this local tool and opens the retailer's website.

CSV files include inputs, signed remaining distances, formulas, units, the measurement-source label and the scope statement. Printing expands the formula details for the record and restores their previous state afterwards.

## Maintenance

Keep the formulas, diagram, labels and exports consistent when making changes. Recheck the reproducible example above, an unused edge with zero extent, a boundary-crossing case and a centimetre/inch round trip. Confirm that invalid input still pauses the model and prevents export. Changes to layout should preserve labelled controls, keyboard access, reduced-motion preferences and the print record.

This package has no automatic update service or promised support term. Retain the scope and publisher disclosures when sharing a measurement record.

## Source availability

Source is available for inspection. This package does not include or claim an open-source license.
