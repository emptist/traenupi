import * as gleam from "#gleam/prelude";
import { Model, ModelPricing, ModelsResponse } from "./openrouter_models.mjs";

export function get_models(apiKey) {
  const url = "https://openrouter.ai/api/v1/models";
  
  return fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          return new gleam.Error(`API error: ${response.status} - ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      if (data instanceof gleam.Error) {
        return data;
      }
      
      const models = data.data.map(model => {
        return new Model(
          model.id,
          model.name,
          model.description || null,
          model.context_length || 0,
          new ModelPricing(
            model.pricing?.prompt || "0",
            model.pricing?.completion || "0",
          ),
        );
      });
      
      return new gleam.Ok(new ModelsResponse(gleam.toList(models)));
    })
    .catch(error => {
      return new gleam.Error(`Network error: ${error.message}`);
    });
}
