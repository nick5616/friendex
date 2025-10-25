export const capitalizeEachFirstLetter = (sentence) => {
    return sentence
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export const fromCommaStringToArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }
    if (value) {
        return value.split(",").map((tag) => tag.trim());
    }
    return [];
};

export const fromArrayToCommaString = (value) => {
    if (Array.isArray(value)) {
        return value.join(", ");
    }
    return value || "";
};
