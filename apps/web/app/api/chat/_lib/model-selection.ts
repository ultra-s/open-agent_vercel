import type { AgentModelSelection } from "@open-agents/agent";
import type { GatewayConfig } from "@open-agents/agent";
import { isByokModelOptionId, parseByokModelOptionId } from "@/lib/byok";
import { getCustomGatewayConfig } from "@/lib/gateway-config";
import { resolveAvailableModelId } from "@/lib/model-availability";
import { type ModelVariant, resolveModelSelection } from "@/lib/model-variants";
import { APP_DEFAULT_MODEL_ID } from "@/lib/models";
import {
  resolveGatewayModelToByok,
  resolveModelToGatewayConfig,
  stripGatewayProviderPrefix,
} from "@/lib/resolve-byok-model";

interface ResolveChatModelSelectionParams {
  selectedModelId: string | null | undefined;
  modelVariants: ModelVariant[];
  missingVariantLabel: string;
  userId?: string;
  byokConnections?: any[];
  activeByokConnectionId?: string | null;
}

export async function resolveChatModelSelection({
  selectedModelId,
  modelVariants,
  missingVariantLabel,
  userId,
  byokConnections,
  activeByokConnectionId,
}: ResolveChatModelSelectionParams): Promise<AgentModelSelection> {
  const requestedModelId = selectedModelId ?? APP_DEFAULT_MODEL_ID;
  const selection = resolveModelSelection(requestedModelId, modelVariants);

  if (selection.isMissingVariant) {
    console.warn(
      `${missingVariantLabel} "${requestedModelId}" was not found. Falling back to default model.`,
    );
    return { id: APP_DEFAULT_MODEL_ID as AgentModelSelection["id"] };
  }

  const availableModelId = resolveAvailableModelId(selection.resolvedModelId);
  if (availableModelId !== selection.resolvedModelId) {
    console.warn(
      `${missingVariantLabel} "${requestedModelId}" resolves to disabled model "${selection.resolvedModelId}". Falling back to default model.`,
    );
    return { id: APP_DEFAULT_MODEL_ID as AgentModelSelection["id"] };
  }

  let config: GatewayConfig | undefined;
  // The model id actually sent to the provider. For an explicit BYOK model
  // selection this must be the provider-native model id (e.g. "claude-3-opus"),
  // NOT the composite "byok:model:<conn>:<modelId>" picker id.
  let runtimeModelId = availableModelId;

  // Priority order for gateway routing:
  // 1. Explicit BYOK model selection (user selected "Model Name (BYOK)")
  // 2. Custom gateway (FreeModel or other endpoint via GATEWAY_* env vars)
  // 3. BYOK connections (per-model or active connection)
  // 4. Default Vercel AI Gateway (no config returned)

  if (isByokModelOptionId(availableModelId)) {
    // Explicit BYOK model: resolve the connection and native model id
    if (userId && byokConnections) {
      config = resolveModelToGatewayConfig(
        availableModelId,
        byokConnections,
        activeByokConnectionId || null,
      );
    }
    const parsed = parseByokModelOptionId(availableModelId);

    if (!config || !parsed) {
      console.warn(
        `${missingVariantLabel} references BYOK model "${availableModelId}" but its connection could not be resolved. Falling back to default model.`,
      );
      return { id: APP_DEFAULT_MODEL_ID as AgentModelSelection["id"] };
    }

    runtimeModelId = parsed.modelId;
  } else {
    // Hardcoded/catalog gateway model was selected (e.g. "openai/gpt-4-turbo")
    // Check custom gateway first (FreeModel or other OpenAI-compatible endpoints)
    const customGatewayConfig = getCustomGatewayConfig();

    if (customGatewayConfig) {
      // Custom gateway is configured and takes priority over BYOK
      config = customGatewayConfig;
      runtimeModelId = stripGatewayProviderPrefix(availableModelId);
    } else if (userId && byokConnections) {
      // No custom gateway; check BYOK connections
      // First, check for per-model BYOK match
      const gatewayMatch = resolveGatewayModelToByok(
        availableModelId,
        byokConnections,
      );

      if (gatewayMatch) {
        config = gatewayMatch.config;
        runtimeModelId = gatewayMatch.modelId;
      } else {
        // Otherwise, check if an active connection should route this model
        config = resolveModelToGatewayConfig(
          availableModelId,
          byokConnections,
          activeByokConnectionId || null,
        );

        if (config) {
          runtimeModelId = stripGatewayProviderPrefix(availableModelId);
        }
      }
    }
    // If no custom gateway and no BYOK match, config remains undefined
    // and the request goes to the default Vercel AI Gateway
  }

  return {
    id: runtimeModelId as AgentModelSelection["id"],
    ...(selection.providerOptionsByProvider
      ? {
          providerOptionsOverrides: selection.providerOptionsByProvider,
        }
      : {}),
    ...(config ? { config } : {}),
  };
}
