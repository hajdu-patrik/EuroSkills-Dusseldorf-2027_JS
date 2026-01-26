// Wind direction vectors and labels
export const WIND_DIRECTIONS = {
  North: { dx: 0, dy: -1, label: 'North (N)', arrow: '↓' }, // Up to down wind
  South: { dx: 0, dy: 1, label: 'South (S)', arrow: '↑' },  // Down to up wind
  East:  { dx: 1, dy: 0, label: 'East (E)', arrow: '←' },   // Right to left wind
  West:  { dx: -1, dy: 0, label: 'West (W)', arrow: '→' }   // Left to right wind
};

// Helper function to get a cell by coordinates
const getCellAt = (cells, x, y) => {
  if (x < 0 || x >= 20 || y < 0 || y >= 20) {
    return { type: 'Grass', hasTurbine: false }; 
  }
  return cells.find(c => c.x === x && c.y === y);
};

// Wind speed calculation for each cell
export const calculateWindSpeed = (cell, allCells, baseSpeed, directionKey) => {
  const dir = WIND_DIRECTIONS[directionKey];
  let modifier = 0;
  let reasons = [];
  
  // 1. Rule: Lake effect (+20% if a lake is within 2 cells "behind" us)
  for (let i = 1; i <= 2; i++) {
    const neighbor = getCellAt(allCells, cell.x - (dir.dx * i), cell.y - (dir.dy * i));
    if (neighbor.type === 'Lake') {
      modifier += 0.2;
      reasons.push('Lake effect (+20%)');
      break; 
    }
  }

  // 2. Rule: Mountain effect (-30% if a mountain is within 5 cells)
  for (let i = 1; i <= 5; i++) {
    const neighbor = getCellAt(allCells, cell.x - (dir.dx * i), cell.y - (dir.dy * i));
    if (neighbor.type === 'Mountain') {
      modifier -= 0.3;
      reasons.push('Mountain shadow (-30%)');
      break;
    }
  }

  // 3. Rule: Wake zone (-15% if another turbine is within 3 cells)
  for (let i = 1; i <= 3; i++) {
    const neighbor = getCellAt(allCells, cell.x - (dir.dx * i), cell.y - (dir.dy * i));
    if (neighbor.hasTurbine && neighbor !== cell) {
      modifier -= 0.15;
      reasons.push('Turbine wake zone (-15%)');
      break;
    }
  }

  // Resulting speed
  const finalSpeed = baseSpeed * (1 + modifier);
  
  return {
    speed: Math.max(0, finalSpeed),
    modifier: modifier,
    reasons: reasons
  };
};

// Power calculation
export const calculatePower = (windSpeed) => {
  const v = windSpeed;
  const v_cut_in = 3;
  const v_rated = 12;
  const v_cut_out = 25;
  const p_rated = 1500;

  if (v < v_cut_in) return 0;
  if (v >= v_cut_out) return 0;
  if (v >= v_rated && v < v_cut_out) return p_rated;

  const term = (v - v_cut_in) / (v_rated - v_cut_in);
  return p_rated * Math.pow(term, 3);
};