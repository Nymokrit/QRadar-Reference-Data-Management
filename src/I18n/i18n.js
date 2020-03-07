import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
    .use(LanguageDetector)
    .init({
        // we init with resources
        resources: {
            en: {
                translations: {
                    "Search": "Search",
                    "Filter Table": "Filter Table",
                    "Clear Data": "Clear Data",
                    "Create New": "Create New",
                    "Delete": "Delete",
                    "Delete Set": "Delete Set",
                    "Delete Map": "Delete Map",
                    "Delete Map of Sets": "Delete Map of Sets",
                    "Delete Table": "Delete Table",
                    "Add Entry": "Add Entry",
                    "Bulk Add": "Bulk Add",
                    "Import CSV": "Import CSV",
                    "Export CSV": "Export CSV",
                    "Number of Elements": "Number of Elements",
                    "Creation Time": "Creation Time",
                    "Value Type": "Value Type",
                    "Value Types": "Value Types",
                    "Key Type": "Key Type",
                    "Key Types": "Key Types",
                    "Time To Live": "Time To Live",
                    "Dependents": "Dependents",
                    "Items per page": "Items per page",
                }
            },
            de: {
                translations: {
                    "Search": "Suchen",
                    "Filter Table": "Tabelle durchsuchen",
                    "Clear Data": "Daten löschen",
                    "Create New": "Hinzufügen",
                    "Delete": "Löschen",
                    "Delete Set": "Set löschen",
                    "Delete Map": "Map löschen",
                    "Delete Map of Sets": "Map of Sets löschen",
                    "Delete Table": "Tabelle löschen",
                    "Add Entry": "Eintrag hinzufügen",
                    "Bulk Add": "Mehrere hinzufügen",
                    "Import CSV": "CSV importieren",
                    "Export CSV": "CSV exportieren",
                    "Number of Elements": "Anzahl Elemente",
                    "Creation Time": "Erstelldatum",
                    "Value Type": "Werttyp",
                    "Key Type": "Schlüsseltyp",
                    "Value Types": "Werttypen",
                    "Key Types": "Schlüsseltypen",
                    "Timeout Type": "Ablauftyp",
                    "Time To Live": "Ablaufdatum",
                    "Dependents": "Abhängigkeiten",
                    "Items per page": "Elemente pro Seite",
                    "pages": "Seiten",
                    "items": "Elementen",
                    "of": "von",
                }
            }
        },
        fallbackLng: "en",
        debug: true,

        // have a common namespace used around the full app
        ns: ["translations"],
        defaultNS: "translations",

        keySeparator: false, // we use content as keys

        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
