"use client";
import { Button } from "@/components/ui/button";
import {
    ProductVariant,
    RetrieveProductResponse,
} from "@/interfaces/PrintifyTypes";
import { ImagesCarousel } from "../ImageCarousel";
import { useEffect, useMemo, useState } from "react";
import { SmallLoadingSpinner } from "../loading/SmallLoadingSpinner";
import { isSellingPriceProfitable } from "../../lib/pricing/isSellingPriceProfitable";
import { Variant } from "@/interfaces/Printify/Variant";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { generateUnroundedPriceInUsd } from "@/lib/pricing/generateUnroundedPriceInUsd";
import { convertUSDToGBP } from "@/lib/currency/convertUSDToGBP";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toggleImageBackgroundButtonAction } from "@/actions/toggleImageBackgroundButtonAction";
import {
    ReadonlyURLSearchParams,
    useParams,
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import { SomethingWrongButton } from "../buttons/SomethingWrongButton";
import { CountryCode } from "@/lib/stripe/createCheckoutSession";
import { DisplayName } from "@/lib/printify/productsData";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { capitalize } from "lodash";
import { track } from "@vercel/analytics";
import { SaveForLaterDialogueAndButton } from "../dialogues/SaveForLaterDialogueAndButton";
import { setNewSearchParamsAndPushRoute } from "./setNewSearchParamsAndPushRoute";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { CountrySetter } from "../country/CountrySetter";
import { CountryPicker } from "../country/CountryPicker";
import { COUNTRIES_WE_SELL_IN } from "@/app/data/consts";
import { customSort } from "@/lib/customSort";

export interface Options {
    id: number;
    title: string;
}

export function ProductDetails({
    retrievedProduct,
    variants,
    printifyImageId,
}: {
    retrievedProduct: RetrieveProductResponse;
    variants: Variant[];
    printifyImageId: string;
}) {
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const router = useRouter();
    const { images, print_provider_id, blueprint_id, options } =
        retrievedProduct;

    const optionTypes = options.map(({ type }) => type);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const country = searchParams.get("country") as CountryCode;
    const scale = searchParams.get("scale") as unknown as number;
    const x = searchParams.get("x") as unknown as number;
    const y = searchParams.get("y") as unknown as number;
    const params = useParams();
    const productType = params["productType"] as DisplayName;
    const [sellingPriceInLocalCurrency, setSellingPriceInLocalCurrency] =
        useState<number>();

    const selectedOptions = optionTypes.map((type) => ({
        title: type,
        value: searchParams.get(type),
    }));

    const selectedVariant = variants.find((variant) =>
        selectedOptions.every(
            ({ title, value }) => variant.options[title] === value,
        ),
    );

    const filteredImages = useMemo(
        () =>
            selectedVariant
                ? images.filter((image) =>
                      image.variant_ids.includes(selectedVariant.id),
                  )
                : [],
        [selectedVariant, images],
    );

    const selectedProductVariant = useMemo(() => {
        return retrievedProduct.variants.find(
            (variants) => variants.id === selectedVariant?.id,
        ) as ProductVariant;
    }, [selectedVariant, retrievedProduct.variants]);

    useEffect(() => {
        const handlePricing = async () => {
            if (!selectedProductVariant) {
                console.warn("No selectedProductVariant");
                return;
            }
            const generatedUnroundedPriceInUsd =
                await generateUnroundedPriceInUsd({
                    selectedVariant: selectedProductVariant,
                    blueprint_id,
                    print_provider_id,
                    country,
                });

            const generatedUnroundedPriceInGbp = await convertUSDToGBP(
                generatedUnroundedPriceInUsd,
            );

            const sellingPriceInLocalCurrency = roundUpToNearestInteger(
                country === "GB"
                    ? generatedUnroundedPriceInGbp
                    : generatedUnroundedPriceInUsd,
            );

            setSellingPriceInLocalCurrency(sellingPriceInLocalCurrency);
        };
        handlePricing();
    }, [selectedProductVariant, country, blueprint_id, print_provider_id]);

    const onClick = async () => {
        track("Buy now");
        if (!sellingPriceInLocalCurrency) {
            throw new Error("No selling price");
        }
        if (
            !(await isSellingPriceProfitable({
                selectedVariant: selectedProductVariant,
                sellingPriceInLocalCurrency,
                blueprint_id,
                print_provider_id,
                country,
            }))
        ) {
            throw new Error("Something went wrong");
        }
        setCheckoutLoading(true);
        fetch("/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                productId: retrievedProduct.id,
                productType: retrievedProduct.tags[1],
                order_title: retrievedProduct.title,
                order_variant_label: selectedVariant?.title, // ? to fix lint issue shouldn't really be there
                orderVariantId: selectedVariant?.id, // ? to fix lint issue shouldn't really be there
                order_preview: filteredImages[0].src,
                price: sellingPriceInLocalCurrency * 100, // 100 is weird imo
                country,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                window.location.href = data.url;
                setCheckoutLoading(false);
            });
    };

    const priceCurrencyPrefix = country === "GB" ? `£` : `$`;

    const priceString =
        priceCurrencyPrefix +
        (sellingPriceInLocalCurrency
            ? country === "GB"
                ? `${sellingPriceInLocalCurrency}`
                : `${sellingPriceInLocalCurrency}`
            : "");

    const CustommiseDialog = () => (
        <Dialog>
            <DialogTrigger asChild className="w-full">
                <Button variant={"outline"}>Customise</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Customise</DialogTitle>
                </DialogHeader>
                <Button
                    variant={"secondary"}
                    onClick={async () => {
                        track("Toggle Background");
                        await toggleImageBackgroundButtonAction({
                            currentImageId: printifyImageId,
                            country,
                            productType,
                        });
                    }}
                >
                    Toggle Image Background
                </Button>
                <>
                    <Button
                        variant={"secondary"}
                        className="w-full"
                        onClick={() => {
                            track("Position Image on Front");
                            setNewSearchParamsAndPushRoute({
                                searchParams,
                                name: "position",
                                value: "front",
                                router,
                                pathname,
                            });
                        }}
                    >
                        Position Image on Front
                    </Button>
                    <Button
                        variant={"secondary"}
                        className="w-full"
                        onClick={() => {
                            track("Position image on back");
                            setNewSearchParamsAndPushRoute({
                                searchParams,
                                name: "position",
                                value: "back",
                                router,
                                pathname,
                            });
                        }}
                    >
                        Position Image on Back
                    </Button>
                </>
                <UpdateSearchParamSlider
                    name="scale"
                    router={router}
                    defaultValue={0.7}
                    currentValue={scale}
                    pathname={pathname}
                    searchParams={searchParams}
                />
                <UpdateSearchParamSlider
                    name="x"
                    router={router}
                    defaultValue={0.5}
                    currentValue={x}
                    pathname={pathname}
                    searchParams={searchParams}
                />
                <UpdateSearchParamSlider
                    name="y"
                    router={router}
                    defaultValue={0.5}
                    currentValue={y}
                    pathname={pathname}
                    searchParams={searchParams}
                />
            </DialogContent>
        </Dialog>
    );

    if (!country) {
        console.error("No country on product page");
        return <CountrySetter />;
    }

    if (COUNTRIES_WE_SELL_IN.indexOf(country) === -1) {
        return <CountryPicker />;
    }

    const OptionsSelectors = () => (
        <div id="selectContainer" className="flex justify-between gap-2">
            {optionTypes.map((type) => (
                <Select
                    key={type}
                    onValueChange={(value) => {
                        setNewSearchParamsAndPushRoute({
                            name: type,
                            searchParams,
                            pathname,
                            router,
                            value,
                        });
                    }}
                    value={searchParams.get(type) || undefined}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={capitalize(type)} />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from(
                            new Set(
                                variants.map(
                                    (variant) => variant.options[type],
                                ),
                            ),
                        )
                            .sort(customSort)
                            .map((value) => (
                                <SelectItem key={value} value={value}>
                                    {value}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
            ))}
        </div>
    );

    if (!selectedVariant) {
        // should really not be showing users options to get here but this will prevent them from trying to order something that doesn't actually exist
        console.warn("No selected variant");
        return (
            <>
                <p>Sorry this combination of options is unavailable</p>
                <OptionsSelectors />
            </>
        );
    }

    return (
        <div className="flex w-full flex-col items-center justify-center text-center">
            {images ? (
                <ImagesCarousel images={filteredImages} />
            ) : (
                <div>Product Not Available</div>
            )}
            <div className="mt-4 flex w-full flex-col gap-2">
                <OptionsSelectors />

                <CustommiseDialog />

                <Card>
                    <CardHeader>
                        <CardTitle>{priceString}</CardTitle>
                        <CardDescription>Free shipping</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <div className="mt-4 flex w-full flex-col items-center gap-4">
                <Button
                    onClick={onClick}
                    className="w-full bg-blue-500 text-white hover:bg-blue-700"
                    disabled={!sellingPriceInLocalCurrency}
                >
                    {checkoutLoading ? (
                        <div className="flex flex-row items-center">
                            <SmallLoadingSpinner className="fill-white" />
                        </div>
                    ) : (
                        <>Buy now</>
                    )}
                </Button>

                <SaveForLaterDialogueAndButton
                    link={pathname + "?" + searchParams.toString()}
                />

                <SomethingWrongButton />
            </div>
        </div>
    );
}

function roundUpToNearestInteger(x: number) {
    return Math.ceil(x / 1) * 1;
}

function UpdateSearchParamSlider({
    name,
    router,
    searchParams,
    pathname,
    defaultValue,
    currentValue,
}: {
    name: string;
    router: AppRouterInstance;
    searchParams: ReadonlyURLSearchParams;
    pathname: string;
    defaultValue: number;
    currentValue?: number;
}) {
    return (
        <>
            <Label htmlFor={`${name}-slider`}>{capitalize(name)}</Label>
            <Slider
                id={`${name}-slider`}
                defaultValue={[currentValue ?? defaultValue]}
                max={1}
                min={0.1}
                step={0.1}
                onValueChange={(value) => {
                    setNewSearchParamsAndPushRoute({
                        searchParams,
                        name,
                        value: value[0].toString(),
                        router,
                        pathname,
                    });
                }}
            />
        </>
    );
}
