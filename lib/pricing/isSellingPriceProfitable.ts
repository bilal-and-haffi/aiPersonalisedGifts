"use server";
import { ProductVariant } from "@/interfaces/PrintifyTypes";
import { getShippingCostInCents } from "../printify/shipping/getShippingCostsInCents";
import { convertGBPToUSD } from "../currency/convertGBPToUSD";
import { CountryCode } from "../stripe/createCheckoutSession";

export type Currency = "gbp" | "usd";

export async function isSellingPriceProfitable({
    selectedVariant,
    sellingPriceInLocalCurrency,
    print_provider_id,
    blueprint_id,
    country,
}: {
    selectedVariant: ProductVariant;
    sellingPriceInLocalCurrency: number;
    print_provider_id: number;
    blueprint_id: number;
    country: CountryCode;
}) {
    const printifyProductCostInUsd = selectedVariant.cost / 100;

    const printifyShippingCostInUsd =
        (await getShippingCostInCents({
            print_provider_id,
            blueprint_id,
            deliveryCountry: country,
        })) / 100;

    const totalPrintifyCostInUsd =
        printifyProductCostInUsd + printifyShippingCostInUsd;

    const minimumProfitInUsd = 3;

    const priceInUsd =
        country === "GB"
            ? await convertGBPToUSD(sellingPriceInLocalCurrency)
            : sellingPriceInLocalCurrency;

    const profitInUsd = priceInUsd - totalPrintifyCostInUsd;

    const isPriceOkay = profitInUsd > minimumProfitInUsd;

    if (!isPriceOkay) {
        console.error({
            printifyProductCostInUsd,
            printifyShippingCostInUsd,
            totalPrintifyCostInUsd,
            minimumProfitInUsd,
            profitInUsd,
            priceInUsd,
            isPriceOkay,
            country,
            sellingPriceInLocalCurrency,
            msg: "Pricing issue!",
        });
    }

    return isPriceOkay;
}
