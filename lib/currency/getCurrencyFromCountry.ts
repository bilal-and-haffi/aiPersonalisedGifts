import { CountryCode } from "../stripe/createCheckoutSession";

export function getCurrencyFromCountry(country: CountryCode) {
    if (country === "US") {
        return "usd";
    } else if (country === "GB") {
        return "gbp";
    }
    throw new Error("No currency for country");
}
