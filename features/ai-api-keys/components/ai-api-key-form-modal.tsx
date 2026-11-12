"use client";

import { Form, Input, Select } from "antd";

import { FormActions, FormModal } from "@/components/common";
import { changedFields, fieldErrorHandler, hasChanges, zodRule } from "@/lib/form";

import { useCreateAiApiKey, useUpdateAiApiKey } from "../api/ai-api-keys.queries";
import { AiApiKeyErrorCode } from "../errors";
import { formatMaskedKey } from "../masked-key";
import {
  AI_API_KEY_LIMITS,
  createAiApiKeySchema,
  updateAiApiKeySchema,
} from "../schemas/ai-api-key.schema";

import { DefaultModelItem } from "./default-model-item";

import type { AiApiKeyFormValues } from "../schemas/ai-api-key.schema";
import type { IAiApiKey, IAiCatalogOption } from "../types/ai-api-key.types";

interface IAiApiKeyFormModalProps {
  open: boolean;
  /** Có giá trị là đang sửa; không có là thêm mới. */
  apiKey?: IAiApiKey;
  /** Nhà cung cấp mà BE hỗ trợ (GET /ai-api-keys/providers). */
  providers: readonly IAiCatalogOption[];
  /** `id` nhà cung cấp đã có key: mỗi nhà cung cấp chỉ được một key. */
  usedProviders: readonly string[];
  onClose: () => void;
}

const fields = createAiApiKeySchema.shape;

function AiApiKeyForm({
  apiKey,
  providers,
  usedProviders,
  onClose,
}: Omit<IAiApiKeyFormModalProps, "open">) {
  const [form] = Form.useForm<AiApiKeyFormValues>();
  const createKey = useCreateAiApiKey();
  const updateKey = useUpdateAiApiKey();
  const submitting = createKey.isPending || updateKey.isPending;

  const watchedProvider = Form.useWatch("provider", form);
  const provider = apiKey?.provider.id ?? watchedProvider;

  const handleFinish = (values: AiApiKeyFormValues) => {
    const callbacks = {
      onSuccess: onClose,
      onError: fieldErrorHandler(form, {
        [AiApiKeyErrorCode.providerHasKey]: "provider",
        [AiApiKeyErrorCode.modelNotSupported]: "defaultModel",
      }),
    };

    if (apiKey) {
      // Để trống key là giữ key cũ; bỏ chọn model là gửi "" để xoá model mặc định.
      const { secretKey, defaultModel = "" } = updateAiApiKeySchema.parse(values);
      const current = { defaultModel: apiKey.defaultModel?.id ?? "" };
      const body = { ...(secretKey && { secretKey }), ...changedFields(current, { defaultModel }) };
      if (!hasChanges(body)) return onClose();
      updateKey.mutate({ uid: apiKey.uid, body }, callbacks);
      return;
    }
    const { defaultModel, ...rest } = createAiApiKeySchema.parse(values);
    createKey.mutate({ ...rest, defaultModel: defaultModel || undefined }, callbacks);
  };

  // Model thuộc từng nhà cung cấp: đổi nhà cung cấp thì bỏ model đã chọn.
  const handleValuesChange = (changed: AiApiKeyFormValues) => {
    if ("provider" in changed) form.setFieldValue("defaultModel", undefined);
  };

  return (
    <Form<AiApiKeyFormValues>
      form={form}
      layout="vertical"
      initialValues={
        apiKey
          ? { defaultModel: apiKey.defaultModel?.id }
          : { provider: providers.find(({ id }) => !usedProviders.includes(id))?.id }
      }
      disabled={submitting}
      onValuesChange={handleValuesChange}
      onFinish={handleFinish}
    >
      {apiKey ? (
        <Form.Item label="Nhà cung cấp">
          <Input value={apiKey.provider.name} disabled />
        </Form.Item>
      ) : (
        <Form.Item label="Nhà cung cấp" name="provider" required rules={[zodRule(fields.provider)]}>
          <Select
            placeholder="Chọn nhà cung cấp"
            options={providers.map(({ id, name }) => {
              const taken = usedProviders.includes(id);
              return { value: id, label: taken ? `${name} (đã có key)` : name, disabled: taken };
            })}
          />
        </Form.Item>
      )}
      <Form.Item
        label="API key"
        name="secretKey"
        required={!apiKey}
        rules={[zodRule(apiKey ? updateAiApiKeySchema.shape.secretKey : fields.secretKey)]}
        extra={
          apiKey
            ? `Để trống để giữ key hiện tại (${formatMaskedKey(apiKey.secretKey)}).`
            : "Key được mã hoá khi lưu và sẽ không hiển thị lại."
        }
      >
        <Input.Password
          // Không để trình duyệt gợi ý hay lưu key như một mật khẩu.
          autoComplete="new-password"
          autoFocus
          maxLength={AI_API_KEY_LIMITS.secretKeyMaxLength}
          placeholder={apiKey ? "Nhập key mới nếu muốn thay" : "Dán API key của nhà cung cấp"}
        />
      </Form.Item>
      <DefaultModelItem provider={provider} />
      <FormActions
        onCancel={onClose}
        submitting={submitting}
        submitText={apiKey ? "Lưu thay đổi" : "Lưu API key"}
      />
    </Form>
  );
}

export function AiApiKeyFormModal({ open, apiKey, onClose, ...rest }: IAiApiKeyFormModalProps) {
  return (
    <FormModal
      title={apiKey ? `Sửa API key ${apiKey.provider.name}` : "Thêm API key"}
      open={open}
      onClose={onClose}
    >
      <AiApiKeyForm apiKey={apiKey} onClose={onClose} {...rest} />
    </FormModal>
  );
}
