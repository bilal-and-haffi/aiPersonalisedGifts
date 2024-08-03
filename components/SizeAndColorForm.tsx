"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type Size = "S" | "M" | "L" | "XL" | "2XL" | "3XL" | "4XL" | "5XL";

export const SizeAndColorSelector = ({
    sizes,
    colours,
    selectedSize: selectedSizeId,
    selectedColor: selectedColorId,
    setSelectedSize: setSelectedSize,
    setSelectedColor: setSelectedColor,
}: {
    sizes: Size[];
    colours: string[];
    selectedSize: string;
    selectedColor: string;
    setSelectedSize: (size: string) => void;
    setSelectedColor: (color: string) => void;
}) => {
    const sizeWeightForSorting = new Map<Size, number>([
        ["S", 1],
        ["M", 2],
        ["L", 3],
        ["XL", 4],
        ["2XL", 5],
        ["3XL", 6],
        ["4XL", 7],
        ["5XL", 8],
    ]);

    return (
        <>
            {colours.length > 0 && (
                <Select
                    onValueChange={(value) => setSelectedColor(value)}
                    value={selectedColorId}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Color" />
                    </SelectTrigger>
                    <SelectContent>
                        {colours.sort().map((colour) => (
                            <SelectItem key={colour} value={colour}>
                                {colour}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {sizes.length > 0 && (
                <Select
                    onValueChange={(value) => setSelectedSize(value)}
                    value={selectedSizeId}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                        {sizes
                            .sort(
                                (a: Size, b: Size) =>
                                    sizeWeightForSorting.get(a)! -
                                    sizeWeightForSorting.get(b)!,
                            )
                            .map((size) => (
                                <SelectItem key={size} value={size}>
                                    {size}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
            )}
        </>
    );
};
