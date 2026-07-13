import { Connection } from 'mongoose';
export declare class HealthService {
    private readonly connection;
    constructor(connection: Connection);
    checkDb(): {
        status: string;
        database: {
            state: string;
            connected: boolean;
        };
    };
}
