{{cmake.project}}

add_library({{cmake.project_name}} INTERFACE)

target_include_directories({{cmake.project_name}} SYSTEM INTERFACE 
    {{#public.include}}
        "{{this}}"
    {{/public.include}}
)

{{#if public.define}}
target_compile_definitions({{cmake.project_name}} INTERFACE 
    {{#each public.define}}
    {{this}}
    {{/each}}
)

{{/if~}}

{{#if public.link}}
target_link_libraries({{cmake.project_name}} INTERFACE 
    {{#each public.link}}
    {{this}}
    {{/each}}
)

{{/if~}}

{{#if public.compile}}
target_compile_features({{cmake.project_name}} INTERFACE 
    {{#each public.compile}}
    {{this}}
    {{/each}}
)

{{/if~}}

{{#if custom}}
{{custom}}

{{/if~}}

{{cmake.target}}
