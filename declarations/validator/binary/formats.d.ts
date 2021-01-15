declare const _default: {
    image: (data: string) => boolean;
    video: (data: string) => boolean;
    audio: (data: string) => boolean;
    font: (data: string) => boolean;
    xml: (data: string) => boolean;
    html: (data: string) => boolean;
    css: (data: string) => boolean;
    js: (data: string) => boolean;
    json: (data: string) => boolean;
    pdf: (data: string) => boolean;
    ppt: (data: string) => boolean;
    doc: (data: string) => boolean;
    archive: (data: string) => boolean;
    binary: (data: string) => boolean | "";
};
export default _default;
