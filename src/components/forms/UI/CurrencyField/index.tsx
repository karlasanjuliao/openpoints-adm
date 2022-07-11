import React, { memo, useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import NumberFormat from "react-number-format";

const CurrencyField = ({ onValueChange, id: fieldId, initialValue, ...props }) => {
    const [value, setValue] = useState<string | number>('');

    useEffect(() => {
        if (initialValue) {
            setValue(initialValue * 100 * 100)
        }
    }, [])

    const handleChange = (v: any) => {
        setValue(parseFloat(v.value) * 100);
        if (onValueChange) {
            onValueChange(fieldId, v.floatValue / 100 )
        }
    };

    const currencyFormatter = (formatted_value: any) => {
        if (!Number(formatted_value)) return "R$ 0,00";
        const br = { style: "currency", currency: "BRL" };
        return new Intl.NumberFormat("pt-BR", br).format(formatted_value / 100);
    };

    const keyDown = (e: any) => {
        if (e.code === "Backspace" && !value) {
            e.preventDefault();
        }
        if (e.code === "Backspace" && value < 1000) {
            e.preventDefault();
            setValue(0);
        }
    };

    return (
        <NumberFormat
            {...props}
            id={fieldId}
            value={Number(value) / 100}
            format={currencyFormatter}
            onValueChange={handleChange}
            prefix={"R$ "}
            allowEmptyFormatting
            decimalSeparator=","
            thousandSeparator="."
            decimalScale={2}
            customInput={TextField}
            onKeyDown={keyDown}
        />
    );
};

export default memo(CurrencyField);
