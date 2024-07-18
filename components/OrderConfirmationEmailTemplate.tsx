import * as React from "react";

interface OrderConfirmationEmailTemplateProps {
    firstName: string;
    printifyConnectUrl: string;
}

export const OrderConfirmationEmailTemplate: React.FC<
    Readonly<OrderConfirmationEmailTemplateProps>
> = ({ firstName, printifyConnectUrl }) => (
    <div className="flex flex-col items-center space-y-5">
        <p>Hi {firstName},</p>
        <p>Your order has been confirmed!</p>
        <p>Thank you for shopping with AI Print Shop :)</p>

        <p>
            Links:
            <ul>
                <li>
                    <a href={printifyConnectUrl}>Track order</a>
                </li>
                <li>
                    <a href="https://www.ai-print-shop.com/">
                        Continue shopping
                    </a>
                </li>
                <li>
                    <a href="mailto:customer-service@ai-print-shop.com">
                        Email Us. We are happy to help.
                    </a>
                </li>
                <li>
                    <a href="https://www.ai-print-shop.com/feedback">
                        We value your feedback! Tell us what you enjoyed and how
                        we can make your experience even better.
                    </a>
                </li>
            </ul>
        </p>
    </div>
);
