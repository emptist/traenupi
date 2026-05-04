import gleam/dynamic/decode as decode
import gleam/javascript/promise.{type Promise}
import gleam/option.{type Option, None}
import gleam/list

pub type Model {
  Model(
    id: String,
    name: String,
    description: Option(String),
    context_length: Int,
    pricing: ModelPricing,
  )
}

pub type ModelPricing {
  ModelPricing(
    prompt: String,
    completion: String,
  )
}

pub type ModelsResponse {
  ModelsResponse(
    data: List(Model),
  )
}

pub fn decode_model_pricing() -> decode.Decoder(ModelPricing) {
  use prompt <- decode.field("prompt", decode.string)
  use completion <- decode.field("completion", decode.string)
  decode.success(ModelPricing(prompt, completion))
}

pub fn decode_model() -> decode.Decoder(Model) {
  use id <- decode.field("id", decode.string)
  use name <- decode.field("name", decode.string)
  use description <- decode.optional_field("description", None, decode.optional(decode.string))
  use context_length <- decode.field("context_length", decode.int)
  use pricing <- decode.field("pricing", decode_model_pricing())
  decode.success(Model(id, name, description, context_length, pricing))
}

pub fn decode_models_response() -> decode.Decoder(ModelsResponse) {
  use data <- decode.field("data", decode.list(decode_model()))
  decode.success(ModelsResponse(data))
}

@external(javascript, "./openrouter_models_ffi.mjs", "get_models")
pub fn get_models(api_key: String) -> Promise(Result(ModelsResponse, String))

pub fn get_free_models(models: ModelsResponse) -> List(Model) {
  models.data
  |> list.filter(fn(model) { model.pricing.prompt == "0" })
}

pub fn get_model_ids(models: List(Model)) -> List(String) {
  models
  |> list.map(fn(model) { model.id })
}
