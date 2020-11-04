import { AllowedMethods, ResponseFormatter } from "./utils";
export declare function formatter(formatter: ResponseFormatter | boolean): any;
export declare function route(method: AllowedMethods, pathStr: string, render?: boolean): (target: any, name: string, descriptor: PropertyDescriptor) => any;
