import { join } from 'path';
import { load as loadYaml } from 'js-yaml';
import { DEFAULT_CHARACTER_ENCODING, JOB_CONFIG_FILE } from '../constants';
import { getLogger } from '../logging';
import { AnalysisConfig, Parameters } from '../types';
import * as Storage from '../util/storage';

/**
 * Creates and validates a configuration from the config file
 */
export const createConfig = async (jobName: string, configPath: string): Promise<AnalysisConfig> => {
    const logger = getLogger();
    const storage = Storage.create({ log: logger.debug });

    // Read and parse YAML config
    const config = loadYaml(
        await storage.readFile(join(configPath, JOB_CONFIG_FILE), DEFAULT_CHARACTER_ENCODING)
    ) as AnalysisConfig;

    config.name = jobName;

    // Apply defaults to the configuration
    applyConfigDefaults(config);

    // Validate required config properties
    if (!config.model) {
        throw new Error(`Missing required config property in ${configPath}/config.yaml: model`);
    }

    // Validate each context directory has required properties
    for (const [key, value] of Object.entries(config.context || {})) {
        // Apply name default if not provided
        if (!value.name) {
            value.name = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        }

        // Validate based on context type
        switch (value.type) {
            case 'static':
                if (!value.directory) {
                    throw new Error(`Missing required directory property for ${value.type} context ${key} in ${configPath}/config.yaml`);
                }
                break;

            case 'history':
                if (!value.from) {
                    throw new Error(`Missing required 'from' property for history context ${key} in ${configPath}/config.yaml`);
                }
                // months is optional but must be a number if provided
                if (value.months && (typeof value.months !== 'number' && !(typeof value.months === 'string' && /^\${.*}$/.test(value.months)))) {
                    throw new Error(`Invalid months property for history context ${key} in ${configPath}/config.yaml - must be a number or parameter reference`);
                }

                // If months is a parameter reference, validate it points to a valid numeric parameter
                if (typeof value.months === 'string' && /^\${parameters\.(.*)}$/.test(value.months)) {
                    const paramMatch = value.months.match(/^\${parameters\.(.*)}$/);
                    const paramName = paramMatch![1];
                    const param = config.parameters?.[paramName];

                    if (!param) {
                        throw new Error(`Parameter ${paramName} referenced in months for history context ${key} not found in config parameters`);
                    }

                    if (param.type !== 'number') {
                        throw new Error(`Parameter ${paramName} referenced in months for history context ${key} must be of type number`);
                    }

                    if (!param.required && param.default === undefined) {
                        throw new Error(`Parameter ${paramName} referenced in months for history context ${key} must be required or have a default value`);
                    }
                }
                break;

            default:
                throw new Error(`Invalid context type '${value}' for context ${key} in ${configPath}/config.yaml`);
        }
    }

    // Apply defaults to content configurations
    for (const [key, value] of Object.entries(config.content || {})) {
        if (!value.name) {
            // Generate a nice default name from the key
            value.name = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        }
        if (!value.pattern) {
            value.pattern = '**/*.md'; // Default to all markdown files
        }
        if (!value.directory) {
            value.directory = ''; // Default to root of activity directory
        }
    }

    return config;
}

/**
 * Applies sensible defaults to configuration
 */
function applyConfigDefaults(config: AnalysisConfig): void {
    // Set default temperature if not provided
    if (config.temperature === undefined) {
        config.temperature = 0.7;
    }

    // Set default maxCompletionTokens if not provided
    if (config.maxCompletionTokens === undefined) {
        config.maxCompletionTokens = 4000;
    }

    // Apply parameter defaults
    if (config.parameters) {
        for (const param of Object.values(config.parameters)) {
            // If required is not explicitly set and there's no default, mark as required
            if (param.required === undefined) {
                param.required = param.default === undefined || param.default === null;
            }
        }
    }
}

/**
 * Creates parameter objects from configuration and input parameters
 */
export const createParameters = (config: AnalysisConfig, params: Record<string, string | number>): Parameters => {
    const parameters: Parameters = {};

    // Check to see if the params has all of the required parameters from the configuration.  If one is missing, throw an error stating which one is missing.
    for (const [key, value] of Object.entries(config.parameters)) {
        if (value.required && params[key] === undefined) {
            throw new Error(`Missing required parameter: ${key}`);
        }
    }

    // Iterate through all of the parameters defined in the configuration, and assign either the value from the params object or the default value from the configuration.
    for (const [key, value] of Object.entries(config.parameters)) {
        parameters[key] = {
            ...value,
            value: params[key] === undefined ? value.default : params[key]
        };
    }

    return parameters;
} 