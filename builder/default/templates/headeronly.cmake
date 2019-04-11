zpm_project()

add_library("${PROJECT_NAME}" INTERFACE)

target_include_directories("${PROJECT_NAME}" INTERFACE 
{{#include.files}}
    "{{.}}"
{{/include.files}}
)

{{#define}}
target_compile_definitions("${PROJECT_NAME}" INTERFACE 
{{/define}}
    {{#define.definitions}}
    {{.}}
    {{/define.definitions}}
{{#define}}
)
{{/define}}

{{#link}}
target_link_libraries("${PROJECT_NAME}" INTERFACE 
{{/link}}
    {{#link.libraries}}
    {{.}}
    {{/link.libraries}}
{{#link}}
)
{{/link}}

{{#compile}}
target_compile_features("${PROJECT_NAME}" INTERFACE 
{{/compile}}
    {{#compile.features}}
    {{.}}
    {{/compile.features}}
{{#compile}}
)
{{/compile}}

{{#custom}}
{{.}}
{{/custom}}

zpm_default_target("${PROJECT_NAME}")
