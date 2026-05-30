import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // eslint-plugin-react-hooks@7 introduced strict new rules that flag
      // established patterns throughout this codebase. Demote to warnings
      // until the codebase is audited and fixed intentionally.
      "react-hooks/purity": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
    },
  },
];

export default eslintConfig;
