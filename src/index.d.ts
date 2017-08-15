/// <reference types="d3" />

declare interface DataMapOptions {
    element: HTMLElement;
    scope?: string;
    geographyConfig?: GeographyConfigOptions;
    bubblesConfig?: BubblesConfigOptions;
    arcConfig?: ArcConfigOptions;
    setProjection?: (element: HTMLElement, options: any) => DataMapProjection;
    fills?: any;
    data?: () => void;
    done?: (datamap: { svg: SVGElement }) => void;
    responsive?: boolean;
    projection?: string;
    height?: null | number;
    width?: null | number;
    dataType?: "json" | "csv";
    dataUrl?: null | string;
}

declare interface GeographyConfigOptions {
    dataUrl?: null | string;
    hideAntarctica?: boolean;
    hideHawaiiAndAlaska?: boolean;
    borderWidth?: number;
    borderOpacity?: number;
    borderColor?: string;
    popupTemplate?: (geography: GeographyData, data: any) => string;
    popupOnHover?: boolean;
    highlightOnHover?: boolean;
    highlightFillColor?: string;
    highlightBorderColor?: string;
    highlightBorderWidth?: number;
    highlightBorderOpacity?: number;
}

declare interface BubblesConfigOptions {
    borderWidth?: number;
    borderOpacity?: number;
    borderColor?: string;
    popupOnHover?: boolean;
    radius?: null|number,
    popupTemplate?: (geography: GeographyData, data: any) => string;
    fillOpacity?: number;
    animate?: boolean,
    highlightOnHover?: boolean;
    highlightFillColor?: string;
    highlightBorderColor?: string;
    highlightBorderWidth?: number;
    highlightBorderOpacity?: number;
    highlightFillOpacity?: number;
    exitDelay?: number;
    key?: any; //JSON.stringify
}

declare interface ArcConfigOptions {
    strokeColor?: string;
    strokeWidth?: number;
    arcSharpness?: number;
    animationSpeed?: number;
    popupOnHover?: boolean;
    popupTemplate?: (geography: GeographyData, data: any) => string;
}

declare interface GeographyData {
    properties: { name: string };
}

declare interface DataMapProjection {
    path: d3.geo.Path;
    projection: d3.geo.Projection;
}

declare class DataMap {
    constructor(options: DataMapOptions);
    legend(): void;
    updateChoropleth(data: string | any | null, opts?: { reset: boolean }): void;
    bubbles(data: any[], opts?: GeographyConfigOptions): void;
    labels(labelData?: any): void;
    resize(): void;
}

interface JQuery {
    datamaps(options: DataMapOptions): void;
}