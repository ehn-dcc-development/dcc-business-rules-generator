curl https://raw.githubusercontent.com/ehn-dcc-development/ehn-dcc-valuesets/main/vaccine-medicinal-product.json |  jq '.valueSetValues | map_values(.display)' --sort-keys > src/resources/vaccineData.json
# (can sort the resulting map by key by adding -S/--sort-keys)
