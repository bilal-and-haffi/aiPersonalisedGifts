import Link from "next/link";
import Image from "next/image";
import { PrintifyImageResponse, PrintifyProductRequest } from "@/interfaces/PrintifyTypes";
import OpenAI from "openai";
import { PRINTIFY_BASE_URL } from "@/app/consts";

export const maxDuration = 300;

export default async function ImagePage(params: { params: { prompt: string} }) {
    const {prompt} = params.params;
    if (!prompt) {
        console.error('Text is required', { params });
        console.error({prompt})
        return <div>Text is required</div>;
    }
    console.log({prompt});
    const url = await generateImageUrl(prompt);
    const image = await postImageToPrintify(url, 'generatedImage.png');
    const postedProduct = await createProduct(constructProductRequest(image.id));
    await publishPrintifyProduct(postedProduct.id)
    return (
        <div>
            <h1>Image Page</h1>
            {image && <Image src={url} alt="Generated Image" width={200} height={200} />}
            {postedProduct && <Link href={`/product/${postedProduct.id}`}>Go to product</Link>}
        </div>
    );
}

async function publishPrintifyProduct(product_id: string) {
    const endpoint =  `${PRINTIFY_BASE_URL}/v1/shops/${process.env.SHOP_ID}/products/${product_id}/publish.json`;
    const body = JSON.stringify({
        title: true,
        description: true,
        images: true,
        variants: true,
        tags: true,
        keyFeatures: true,
        shipping_template: true
    })
    console.log({endpoint, body})
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`
        },
        body
    });
    const publishProductResponse = await response.json();
    console.log({publishProductResponse});
}

async function postImageToPrintify(url: string, fileName: string): Promise<PrintifyImageResponse> {
    try {
        console.info('postImageToPrintify', { url, fileName });
        const imageRequest = {
            file_name: fileName,
            url: url
        };
        const imageRequestString = JSON.stringify(imageRequest);
        const endpoint = `${PRINTIFY_BASE_URL}/v1/uploads/images.json`;
        console.info('Posting image to Printify', { endpoint, imageRequest, imageRequestString })
        const imageResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`
            },
            body: imageRequestString 
        })
        console.info('Posted image to printify', { imageResponse });

        const imageData: PrintifyImageResponse = await imageResponse.json();
    
        console.info('Posted image to printify' ,{ imageRequest, imageRequestString, imageResponse, imageData })
    
        return imageData;
    }
    catch (error) {
        console.error('Error posting image to Printify', error);
        throw new Error('Error posting image to Printify');
    }
}

const generateImageUrl: (prompt: string) => Promise<string> = async (prompt: string) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('API key not found. Please set the OPENAI_API_KEY in your .env file.');
            throw new Error('API key not found');
        }

        const openai = new OpenAI({apiKey});

        console.info('Generating image...', { prompt });

        const response = await openai.images.generate({
            prompt,
            n: 1, 
            response_format: 'url',
            style: 'natural'
        });

        const url = response.data[0].url!;
        console.info('Generated image:', { url });

        return url;
    } catch (error) {
        console.error('Error generating image:', error);
        throw new Error('Error generating image');
    }
};



async function createProduct({ blueprint_id, description, print_areas, print_provider_id, title, variants}: PrintifyProductRequest ) {
    const productRequest: PrintifyProductRequest = {
        blueprint_id,
        description,
        print_areas,
        print_provider_id,
        title,
        variants
    };
    const productRequestString = JSON.stringify(productRequest);
    console.log({ productRequest, productRequestString });
    
    const productResponse: any = await fetch(`https://api.printify.com/v1/shops/${process.env.SHOP_ID}/products.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PRINTIFY_API_TOKEN}`
        },
        body: productRequestString
    })
    const productData = await productResponse.json();
    console.info({ productData })
    return productData;
}

function constructProductRequest(image_id: string) {
    const productRequest: PrintifyProductRequest = {
        blueprint_id: 145, // Unisex Softstyle T-Shirt
        description: 'A product generated by OpenAI and Printify',
        print_areas: [{
            variant_ids: [
                38192 // Black Large -- should make these dynamic
            ],
            placeholders: [{
                position: 'front',
                images: [{
                    id: image_id,
                    x: 0.5,
                    y: 0.5,
                    scale: 1,
                    angle: 0
                }]
            }]
        }], 
        print_provider_id: 270, // Dimona Tee
        title: 'Generated Product',
        variants: [{
            id: 38192,
            price: 200,
        }]
    };
    return productRequest;

}