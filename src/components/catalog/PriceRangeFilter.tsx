
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  currentMin: number;
  currentMax: number;
  onPriceChange: (min: number, max: number) => void;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  minPrice,
  maxPrice,
  currentMin,
  currentMax,
  onPriceChange,
}) => {
  const [localMin, setLocalMin] = React.useState(currentMin);
  const [localMax, setLocalMax] = React.useState(currentMax);

  const handleSliderChange = (values: number[]) => {
    setLocalMin(values[0]);
    setLocalMax(values[1]);
    onPriceChange(values[0], values[1]);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || minPrice;
    const newMin = Math.max(minPrice, Math.min(value, localMax - 1));
    setLocalMin(newMin);
    onPriceChange(newMin, localMax);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || maxPrice;
    const newMax = Math.min(maxPrice, Math.max(value, localMin + 1));
    setLocalMax(newMax);
    onPriceChange(localMin, newMax);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Стоимость аренды (₽/день)</h3>

      <Slider
        defaultValue={[localMin, localMax]}
        value={[localMin, localMax]}
        max={maxPrice}
        min={minPrice}
        step={10}
        onValueChange={handleSliderChange}
        className="my-6"
      />

      <div className="flex items-center space-x-2">
        <Input
          type="number"
          value={localMin}
          onChange={handleMinInputChange}
          min={minPrice}
          max={localMax - 1}
          className="w-24"
        />
        <span className="text-gray-400">—</span>
        <Input
          type="number"
          value={localMax}
          onChange={handleMaxInputChange}
          min={localMin + 1}
          max={maxPrice}
          className="w-24"
        />
      </div>
    </div>
  );
};

export default PriceRangeFilter;
