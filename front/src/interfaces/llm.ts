export interface ILlmResponse {
  id: string;
  choices: IChoice[];
  created: number;
  model: string;
  object: string;
  service_tier: string;
  system_fingerprint: string;
  usage: IUsage;
}

export interface IChoice {
  finish_reason: string;
  index: number;
  logprobs: ILogprobs;
  message: IMessage;
}

export interface ILogprobs {
  content: unknown;
  refusal: unknown;
}

export interface IMessage {
  role: string;
  content: string;
}

export interface IUsage {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
  completion_tokens_details: ICompletionTokensDetails;
  prompt_tokens_details: IPromptTokensDetails;
}

export interface ICompletionTokensDetails {
  audio_tokens: number;
  reasoning_tokens: number;
}

export interface IPromptTokensDetails {
  audio_tokens: number;
  cached_tokens: number;
}
