import { ProductDetails } from "@/components/ProductDetails";
import { createPrintifyHoodieProduct } from "@/lib/printify/products/createPrintifyHoodieProduct";

export default async function HoodieProductPage({
    params,
    searchParams,
}: {
    params: { printifyImageId: string };
    searchParams: { size?: number; color?: number };
}) {
    const { printifyImageId } = params;
    const { size, color } = searchParams;
    const hoodieProduct = await createPrintifyHoodieProduct(printifyImageId);

    return (
        <>
            <ProductDetails
                retrievedProduct={hoodieProduct}
                sizeId={size || 16} // large
                colorId={color || 418} // black
                printifyImageId={printifyImageId}
            />
        </>
    );
}
