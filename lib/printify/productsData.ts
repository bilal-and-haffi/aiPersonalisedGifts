interface PrintifyProducts {
    enabled: boolean;
    country: "UK" | "US";
    name: string;
    displayName: string;
    blueprintId: number;
    printProviderId: number;
}

const printProviderIds = {
    printClever: 72,
    tShirtAndSons: 6,
    monsterDigital: 29,
    districtPhoto: 28,
};

const blueprintIds = {
    gildan64000UnisexSoftstyleShirt: 145,
    gildan18500UnisexHeavyBlendHoodedSweatshirt: 77,
    ceramicMug: 478,
};

export const products: Record<string, PrintifyProducts> = {
    // UK
    tShirt: {
        enabled: true,
        name: "Gildan 64000 Unisex Softstyle Shirt",
        displayName: "T Shirt",
        blueprintId: 145,
        printProviderId: printProviderIds.tShirtAndSons,
        country: "UK",
    },
    hoodie: {
        enabled: true,
        name: "Unisex Heavy Blend Hooded Sweatshirt",
        displayName: "Hoodie",
        blueprintId: 77,
        printProviderId: printProviderIds.printClever,
        country: "UK",
    },
    mug: {
        enabled: true,
        name: "Mug",
        displayName: "Mug",
        printProviderId: printProviderIds.printClever,
        blueprintId: 1302,
        country: "UK",
    },
    baseballTee: {
        enabled: true,
        name: "Unisex 3\\4 Sleeve Baseball Tee",
        displayName: "Baseball Tee",
        blueprintId: 79,
        printProviderId: printProviderIds.tShirtAndSons,
        country: "UK",
    },
    disabledTShirt: {
        enabled: false,
        name: "Unisex Heavy T Shirt Gildan 5000", // tried and was hard and print felt tacky. supplier was print clever for the order
        displayName: "T Shirt",
        blueprintId: 6,
        printProviderId: printProviderIds.tShirtAndSons,
        country: "UK",
    },
    disabledTShirt2: {
        // TRY ME!
        enabled: false,
        name: "Unisex Jersey Short Sleeve Tee Bella+Canvas 3001",
        displayName: "T Shirt",
        blueprintId: 12,
        printProviderId: printProviderIds.tShirtAndSons,
        country: "UK",
    },

    // US
    usTShirt: {
        enabled: true,
        displayName: "T Shirt",
        printProviderId: printProviderIds.monsterDigital,
        blueprintId: blueprintIds.gildan64000UnisexSoftstyleShirt,
        name: "Unisex Softstyle T-Shirt Gildan 64000",
        country: "US",
    },

    usHoodie: {
        enabled: true,
        displayName: "Hoodie",
        printProviderId: printProviderIds.monsterDigital,
        blueprintId: blueprintIds.gildan18500UnisexHeavyBlendHoodedSweatshirt,
        name: "Unisex Heavy Blend Hooded Sweatshirt",
        country: "US",
    },

    usMug: {
        enabled: true,
        displayName: "Mug",
        printProviderId: printProviderIds.districtPhoto,
        blueprintId: blueprintIds.ceramicMug,
        name: "Ceramic Mug",
        country: "US",
    },
};
