import "./NavLink.scss";
import React from "react";
import MenuItem from "/src/components/generic/MenuItem.jsx";
import { useUtils } from "/src/helpers/utils.js";
import SensitiveButton from "/src/components/generic/SensitiveButton.jsx";

function NavLink({ shrink, label, icon, size, className, rounded, selected, disabled, onClick, tooltip }) {
    const utils = useUtils();

    // Hide "Updates" link
    if (label === "Updates") {
        return null; // Prevent rendering
    }

    return (
        <SensitiveButton 
            className={`nav-link ${utils.strIf(rounded, `nav-link-rounded`)}`} 
            disabled={disabled || label === "Updates"} // Optionally disable "Updates"
            onClick={onClick}
            data-label={label} // Added for CSS targeting
        >
            <MenuItem 
                shrink={shrink}
                label={label}
                icon={icon}
                hoverAnimation={true}
                size={size}
                tooltip={tooltip}
                selected={selected}
                className={className}
            />
        </SensitiveButton>
    );
}

export default NavLink;
