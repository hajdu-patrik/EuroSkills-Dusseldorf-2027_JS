import { memo } from 'react';

// Helper to get turbine color class based on power (moved here verbatim from MapEditor.jsx)
const getTurbineColorClass = (power, min, max) => {
  if (min === max) return "bg-emerald-500/60";

  const ratio = (power - min) / (max - min || 1);

  if (ratio < 0.33) return "bg-red-500/60";
  if (ratio < 0.66) return "bg-orange-400/60";

  return "bg-emerald-500/60";
};

// Helper to get cell classes (moved here verbatim from MapEditor.jsx, `isValid` is now passed in
// instead of being recomputed per cell - transition-all narrowed to transition-colors, see report)
const getCellClasses = (cell, isHovered, simCell, isValid, minPower, maxPower) => {
  let base = "relative flex items-center justify-center transition-colors duration-150 border ";

  let bgClass = "";
  if (cell.hasTurbine) {
    bgClass = getTurbineColorClass(simCell.power, minPower, maxPower);
  } else if (cell.type === 'Lake') {
    bgClass = "hover:bg-sky-500/40";
  } else if (cell.type === 'Mountain') {
    bgClass = "hover:bg-stone-900/40";
  } else {
    bgClass = "bg-emerald-500/5 hover:bg-emerald-400/40";
  }

  if (isHovered && !cell.hasTurbine && !isValid) return `${base} border-red-500/50 bg-red-500/20 cursor-not-allowed`;
  if (cell.type === 'Lake' || cell.type === 'Mountain') return `${base} border-white/10 cursor-not-allowed ${bgClass}`;

  const hoverBorder = cell.hasTurbine
    ? "border-transparent hover:bg-red-500/20"
    : "border-white/10 hover:border-white/50";

  return `${base} cursor-pointer ${hoverBorder} ${bgClass}`;
};

/**
 * One cell of the 400-cell map grid, extracted from MapEditor's render loop and wrapped in
 * React.memo so a single hover/click only re-renders the cell(s) actually affected instead of
 * all 400. The custom comparator compares `simCell` by its rendered fields (power/speed/modifier)
 * rather than by reference, because `simulationData` always produces new cell objects on every
 * recompute even when a given cell's own numbers did not change.
 */
function MapCellImpl({ cell, simCell, isHovered, isValid, arrowRotation, minPower, maxPower, index, turbineImg, removeImg, onCellClick, onCellHover, onCellLeave }) {
  let iconToShow = null;
  let iconAlt = null;
  if (cell.hasTurbine) {
    iconToShow = isHovered ? removeImg : turbineImg;
    iconAlt = isHovered ? 'Remove' : 'Turbine';
  } else if (isHovered) {
    iconToShow = isValid ? turbineImg : removeImg;
    iconAlt = isValid ? 'Turbine' : 'Remove';
  }

  const tooltipText = simCell.hasTurbine
    ? `Power: ${Math.round(simCell.power)} kW\nWind: ${simCell.speed.toFixed(1)} m/s\nModifiers: ${(simCell.modifier * 100).toFixed(0)}%\n${simCell.reasons.join('\n')}`
    : `Wind: ${simCell.speed.toFixed(1)} m/s`;

  return (
    <div
      className={getCellClasses(cell, isHovered, simCell, isValid, minPower, maxPower)}
      onClick={() => onCellClick(index)}
      onMouseEnter={() => onCellHover(index)}
      onMouseLeave={onCellLeave}
      onDragStart={(e) => e.preventDefault()}
      title={tooltipText}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCellClick(index); }}
    >
      {cell.type !== 'Mountain' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none text-[10px] text-stone-900 font-bold select-none">
          <span className="select-none" style={{ transform: `rotate(${arrowRotation}deg)` }}>➤</span>
        </div>
      )}
      {iconToShow && (
        <img src={iconToShow} alt={iconAlt} onDragStart={(e) => e.preventDefault()}
          className={`w-4/5 h-4/5 object-contain drop-shadow-lg pointer-events-none transform-gpu relative z-10 select-none ${!cell.hasTurbine && isHovered && isValid ? 'opacity-50' : 'opacity-100'}`}
        />
      )}
    </div>
  );
}

const areEqual = (prev, next) =>
  prev.cell === next.cell &&
  prev.isHovered === next.isHovered &&
  prev.isValid === next.isValid &&
  prev.arrowRotation === next.arrowRotation &&
  prev.minPower === next.minPower &&
  prev.maxPower === next.maxPower &&
  prev.simCell.power === next.simCell.power &&
  prev.simCell.speed === next.simCell.speed &&
  prev.simCell.modifier === next.simCell.modifier &&
  prev.index === next.index &&
  prev.onCellClick === next.onCellClick &&
  prev.onCellHover === next.onCellHover &&
  prev.onCellLeave === next.onCellLeave &&
  prev.turbineImg === next.turbineImg &&
  prev.removeImg === next.removeImg;

const MapCell = memo(MapCellImpl, areEqual);
export default MapCell;
