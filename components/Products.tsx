"use client";

import { createContext, useEffect, useState } from "react";
import { ProductDetails } from "./ProductDetails";
import { Variant } from "@/interfaces/Printify/Variant";
import { ProductSwitcher } from "./ProductSwitcher";
import { ProductType } from "../types/ProductType";
import { CountryCode } from "@/lib/stripe/createCheckoutSession";
import { getCountryFromIpAddress } from "@/lib/country/getCountryFromIpAddress";

const productsMap = new Map([
    [ProductType.TShirt, "T Shirt"],
    [ProductType.Hoodie, "Hoodie"],
    [ProductType.Mug, "Mug"],
]);
export const CountryCodeContext = createContext<CountryCode>("GB");

export const Products = ({
    productsAndVariants,
}: {
    productsAndVariants: Map<
        ProductType,
        {
            product: any;
            variants: Variant[];
        }
    >;
}) => {
    const [countryCode, setCountryCode] = useState();

    useEffect(() => {
        const fetchAndSetCountryCode = async () => {
            const country = await getCountryFromIpAddress();
            setCountryCode(country);
        };
        fetchAndSetCountryCode();
    }, []);

    const [selectedProductType, setSelectedProductType] = useState<ProductType>(
        ProductType.TShirt,
    );

    const tShirtProduct = productsAndVariants.get(ProductType.TShirt)!.product; // sketch
    const tShirtVariants = productsAndVariants.get(
        ProductType.TShirt,
    )!.variants;
    const hoodieProduct = productsAndVariants.get(ProductType.Hoodie)!.product;
    const hoodieVariants = productsAndVariants.get(
        ProductType.Hoodie,
    )!.variants;
    const mugProduct = productsAndVariants.get(ProductType.Mug)!.product;
    const mugVariants = productsAndVariants.get(ProductType.Mug)!.variants;

    const CurrentProductDetails = () => {
        switch (selectedProductType) {
            case ProductType.TShirt:
                return (
                    <ProductDetails
                        retrievedProduct={tShirtProduct}
                        initialSize="L"
                        initialColor="Black"
                        variants={tShirtVariants}
                    />
                );
            case ProductType.Hoodie:
                return (
                    <ProductDetails
                        retrievedProduct={hoodieProduct}
                        initialSize="L"
                        initialColor="Black"
                        variants={hoodieVariants}
                    />
                );
            case ProductType.Mug:
                return (
                    <ProductDetails
                        retrievedProduct={mugProduct}
                        initialSize="11oz"
                        initialColor="Black"
                        variants={mugVariants}
                    />
                );
        }
    };

    return (
        <>
            <CountryCodeContext.Provider value={countryCode ?? "GB"}>
                <ProductSwitcher
                    selectedProductType={selectedProductType}
                    setSelectedProductType={setSelectedProductType}
                    prompt={tShirtProduct.title}
                    productsMap={productsMap}
                />
                <CurrentProductDetails />
            </CountryCodeContext.Provider>
        </>
    );
};
