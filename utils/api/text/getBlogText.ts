async function getBlogText(url: any) {
    return await fetch('/api/webScrapping/getMediumText?url=' + url)
        .then((res) => res.json())
        .then((data) => {
            if (data.suceess === false) {
                return { content: "Error", success: false };
            }
            else {
                return { content: data.section, success: true };
            }
        }).catch((err) => {
            return { content: "Error", success: false };
        });
}

export {
    getBlogText
};