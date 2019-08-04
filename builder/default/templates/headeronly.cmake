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
    
{{#if public.feature}}
target_compile_features({{@root.cmake.project_name}} INTERFACE 
    {{#each public.feature}}
    {{this}}
    {{/each}}
)

{{/if~}}
    
{{#if public.option}}
target_compile_options({{@root.cmake.project_name}} INTERFACE 
    {{#each public.option}}
    {{this}}
    {{/each}}
)

{{/if~}}



{{#each public.conditions}}
if({{on}})
    
{{#if let.include}}
target_include_directories({{@root.cmake.project_name}} INTERFACE 
    {{#each let.include}}
    {{this}}
    {{/each}}
)

{{/if~}}
    
{{#if let.define}}
target_compile_definitions({{@root.cmake.project_name}} INTERFACE 
    {{#each let.define}}
    {{this}}
    {{/each}}
)

{{/if~}}
    
{{#if let.link}}
target_link_libraries({{@root.cmake.project_name}} INTERFACE 
    {{#each let.link}}
    {{this}}
    {{/each}}
)

{{/if~}}
    
{{#if let.feature}}
target_compile_features({{@root.cmake.project_name}} INTERFACE 
    {{#each let.feature}}
    {{this}}
    {{/each}}
)

{{/if~}}
    
{{#if let.option}}
target_compile_options({{@root.cmake.project_name}} INTERFACE 
    {{#each let.option}}
    {{this}}
    {{/each}}
)

{{/if~}}
    
{{#if let.custom}}
{{this}}

{{/if~}}
    
{{#if otherwise}}
else()
    
{{#if otherwise.include}}
target_include_directories({{@root.cmake.project_name}} INTERFACE 
    {{#each otherwise.include}}
    {{this}}
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.define}}
target_compile_definitions({{@root.cmake.project_name}} INTERFACE 
    {{#each otherwise.define}}
    {{this}}
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.link}}
target_link_libraries({{@root.cmake.project_name}} INTERFACE 
    {{#each otherwise.link}}
    {{this}}
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.feature}}
target_compile_features({{@root.cmake.project_name}} INTERFACE 
    {{#each otherwise.feature}}
    {{this}}
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.option}}
target_compile_options({{@root.cmake.project_name}} INTERFACE 
    {{#each otherwise.option}}
    {{this}}
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.custom}}
{{this}}

{{/if~}}
    
{{/if~}}

endif()

{{/each~}}

{{#if custom}}
{{custom}}

{{/if~}}

{{cmake.target}}
