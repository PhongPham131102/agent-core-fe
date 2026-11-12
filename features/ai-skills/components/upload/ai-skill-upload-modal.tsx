"use client";

import { Form, Input } from "antd";

import { FormActions, FormModal } from "@/components/common";
import { fieldErrorHandler } from "@/lib/form";

import { useCreateAiSkill, useReplaceAiSkillFiles } from "../../api/ai-skills.queries";
import { AI_SKILL_LIMITS, validateSkillZip } from "../../constants";
import { SKILL_FIELD_BY_ERROR } from "../../errors";
import { skillTitle } from "../../skill-title";

import { SkillZipInput } from "./skill-zip-input";

import type { IAiSkill } from "../../types/ai-skill.types";
import type { Rule } from "antd/es/form";

interface IAiSkillUploadModalProps {
  open: boolean;
  /** Có giá trị là thay file của skill này; không có là tải skill mới. */
  skill?: IAiSkill;
  onClose: () => void;
}

interface ISkillUploadValues {
  file?: File;
  code?: string;
}

/** Khớp `AI_SKILL_CODE_PATTERN` bên BE. */
const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const fileRules: Rule[] = [
  { required: true, message: "Vui lòng chọn file .zip" },
  {
    validator: (_rule, file?: File) => {
      const error = file && validateSkillZip(file);
      return error ? Promise.reject(new Error(error)) : Promise.resolve();
    },
  },
];

const codeRules: Rule[] = [
  { pattern: KEBAB_CASE, message: "Chỉ gồm chữ thường không dấu, số và dấu gạch ngang" },
];

function AiSkillUploadForm({ skill, onClose }: Omit<IAiSkillUploadModalProps, "open">) {
  const [form] = Form.useForm<ISkillUploadValues>();
  const createSkill = useCreateAiSkill();
  const replaceFiles = useReplaceAiSkillFiles();
  const submitting = createSkill.isPending || replaceFiles.isPending;

  const handleFinish = ({ file, code }: ISkillUploadValues) => {
    if (!file) return;
    const callbacks = {
      onSuccess: onClose,
      onError: fieldErrorHandler(form, SKILL_FIELD_BY_ERROR),
    };

    if (skill) replaceFiles.mutate({ uid: skill.uid, file }, callbacks);
    else createSkill.mutate({ file, code: code?.trim() || undefined }, callbacks);
  };

  return (
    <Form<ISkillUploadValues>
      form={form}
      layout="vertical"
      disabled={submitting}
      onFinish={handleFinish}
    >
      <Form.Item label="File skill" name="file" required rules={fileRules}>
        <SkillZipInput />
      </Form.Item>
      {!skill && (
        <Form.Item label="Mã" name="code" rules={codeRules}>
          <Input maxLength={AI_SKILL_LIMITS.codeMaxLength} placeholder="Bỏ trống để lấy theo tên" />
        </Form.Item>
      )}
      <FormActions
        onCancel={onClose}
        submitting={submitting}
        submitText={skill ? "Thay file" : "Tải lên"}
      />
    </Form>
  );
}

/** Tải skill mới, hoặc thay toàn bộ file của skill có sẵn (mã giữ nguyên). */
export function AiSkillUploadModal({ open, skill, onClose }: IAiSkillUploadModalProps) {
  return (
    <FormModal
      title={skill ? `Thay file: ${skillTitle(skill)}` : "Tải skill lên"}
      open={open}
      onClose={onClose}
    >
      <AiSkillUploadForm skill={skill} onClose={onClose} />
    </FormModal>
  );
}
