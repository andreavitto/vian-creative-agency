const get = require('lodash.get');

const operators = {
    "exists": (itemValue, value) => {
        if (value === "yes") {
            return !!itemValue;
        } else {
            return !(!!itemValue);
        }
    },
    "eq": (itemValue, value) => itemValue == value,
    "ne": (itemValue, value) => itemValue != value,
    "gt": (itemValue, value) => {
        if (value.startsWith("date:")) {
            const oldDate = new Date(itemValue).getTime();
            const newDate = new Date().getTime() + (Number(value.split(":")[1]))
            return oldDate > newDate
        } else {
            return itemValue > value;
        }
    },
    "lt": (itemValue, value) => {
        if (value.startsWith("date:")) {
            const oldDate = new Date(itemValue).getTime();
            const newDate = new Date().getTime() + (Number(value.split(":")[1]))
            return oldDate < newDate
        } else {
            return itemValue < value;
        }
    },
    "gte": (itemValue, value) => {
        if (value.startsWith("date:")) {
            const oldDate = new Date(itemValue).getTime();
            const newDate = new Date().getTime() + (Number(value.split(":")[1]))
            return oldDate >= newDate
        } else {
            return itemValue >= value;
        }
    },
    "lte": (itemValue, value) => {
        if (value.startsWith("date:")) {
            const oldDate = new Date(itemValue).getTime();
            const newDate = new Date().getTime() + (Number(value.split(":")[1]))
            return oldDate <= newDate
        } else {
            return itemValue <= value;
        }
    },
    "in": (itemValue, value) => {
        if (Array.isArray(value)) {
            if (value.length == 0 || itemValue.length == 0) {
                return false;
            }
            return value.some( v => itemValue.includes(v));
        } else {
            if (!itemValue || !value) {
                return false;
            }
            return itemValue.includes(value);
        }
    },
    "nin": (itemValue, value) => {
        return !operators["in"](itemValue, value);
    },
    "idin": (itemValue, value) => {
        if (Array.isArray(value)) {
            if (value.length == 0 || itemValue.length == 0) {
                return false;
            }
            return value.some( v => itemValue.includes(v));
        } else {
            if (!itemValue || !value) {
                return false;
            }
            return itemValue.includes(value);
        }
    },
    "idnin": (itemValue, value) => {
        return !operators["idin"](itemValue, value);
    }
}

module.exports = function compareItemByFilter(item, filter, currentItem) {
    let [fieldPath, operator, value] = filter;
    let itemValue = get(item.data, fieldPath, "");

    if (fieldPath == "slug" && !itemValue) {
        itemValue = item.inputPath;
        itemValue = itemValue.split('/')
        itemValue = itemValue[itemValue.length - 1].replace('.md', '');
        itemValue = itemValue.replace(";", "")
    }

    if (Array.isArray(itemValue)) {
        itemValue = itemValue.map(e => e.replace('.md', ''));
    } else if (typeof itemValue == "string") {
       itemValue = itemValue.replace('.md', '');
    }
    

    if (value.startsWith("cms/cms/")) {
        value = value.replace("cms/cms/", "cms/")
    }

    if (value.includes("DYN_CONTEXT_FIELD")) {
        const [_, field] = value.split(":");

        if (currentItem) {
            value = get(currentItem.data, field, "");
        }

    } else if (value.includes("DYN_CONTEXT")) {
        if (currentItem) {
            value = currentItem.inputPath.replace("./", "").replace(".md", "");
        }
    }


    if (fieldPath == "slug" && typeof value == "string" && value.startsWith("cms/")) {
        value = value.split('/')
        value = value[value.length - 1].replace('.md', '');
        value = value.replace(";", "")
    }


    if (typeof value == "string" && value.toString().endsWith('.md')) {
        value = value.replace('.md', '');
    }

    if (Array.isArray(value)) {
        value = value.map(v => {
            if (fieldPath == "slug" && typeof v == "string" && v.startsWith("cms/")) {
                v = v.split('/')
                v = v[v.length - 1].replace('.md', '');
                v = v.replace(";", "")
            }

            if (typeof v == "string" && v.toString().endsWith('.md')) {
                v = v.replace('.md', '');
                
            }
            return v;
        });
    }


    if (value === "true") {
        value = true;
    }

    if (value === "false") {
        value = false;
    }


    

    if (operators[operator]) {
        try {
            const result = operators[operator](itemValue, value);
            return result;
        } catch (e) {
            return false;
        }
    }
    return false;
}