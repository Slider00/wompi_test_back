export declare class TransactionCartItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateTransactionDto {
    amount: number;
    currency?: string;
    cardHolder: string;
    cardMaskedNumber: string;
    reference: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
    cart: TransactionCartItemDto[];
}
