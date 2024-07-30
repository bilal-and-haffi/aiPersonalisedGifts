"use server";

import {
    selectAllFromImageWhereImageIdOrRemovedBackgroundImageIdEquals,
    updateImageTableWithRemovedBackgroundImage,
} from "@/db/image";
import { removeBackgroundAndReturnBase64Image } from "./removeBackgroundAndReturnBase64Image";
import { redirect } from "next/navigation";
import { CountryCode } from "@/lib/stripe/createCheckoutSession";
import { postBase64ImageToPrintify } from "@/lib/printify/postBase64ImageToPrintify";

export async function toggleImageBackgroundButtonAction({
    currentImageId,
    country,
}: {
    currentImageId: string;
    country: CountryCode;
}) {
    console.log("Removing background image");
    try {
        const {
            printifyImageId: existingPrintifyImageId,
            removedBackgroundPrintifyImageId:
                existingRemovedBackgroundPrintifyImageId,
            printifyImageUrl,
        } = await selectAllFromImageWhereImageIdOrRemovedBackgroundImageIdEquals(
            currentImageId,
        );

        console.log({
            existingPrintifyImageId,
            existingRemovedBackgroundPrintifyImageId,
            printifyImageUrl,
        });

        if (existingPrintifyImageId === currentImageId) {
            console.log("existingPrintifyImageId === currentImageId");
            if (existingRemovedBackgroundPrintifyImageId) {
                console.log("existingRemovedBackgroundPrintifyImageId");
                redirect(
                    `/product/${existingRemovedBackgroundPrintifyImageId}?country=${country}`,
                );
            } else {
                console.log("else A");

                const removedBackgroundImageBase64Contents =
                    await removeBackgroundAndReturnBase64Image(
                        printifyImageUrl,
                    );

                const {
                    id: removedBackgroundPrintifyImageId,
                    preview_url: removedBackgroundPrintifyImageUrl,
                } = await postBase64ImageToPrintify(
                    removedBackgroundImageBase64Contents,
                    "generatedImage.png",
                );

                await updateImageTableWithRemovedBackgroundImage({
                    printifyImageId: existingPrintifyImageId,
                    removedBackgroundPrintifyImageId,
                    removedBackgroundPrintifyImageUrl,
                });

                redirect(
                    `/product/${removedBackgroundPrintifyImageId}?country=${country}`,
                );
            }
        } else if (
            currentImageId === existingRemovedBackgroundPrintifyImageId
        ) {
            console.log(
                "currentImageId === existingRemovedBackgroundPrintifyImageId",
            );
            redirect(`/product/${existingPrintifyImageId}?country=${country}`);
        }
    } catch (error) {
        console.error({ msg: "failed to remove background", error });
    }
}
