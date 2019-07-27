function(zpm_project)
  get_filename_component(PROJ_NAME "${CMAKE_CURRENT_SOURCE_DIR}" NAME)
  get_filename_component(PROJ_VENDOR_DIR "${CMAKE_CURRENT_SOURCE_DIR}" PATH)
  get_filename_component(PROJ_VENDOR "${PROJ_VENDOR_DIR}" NAME)
  set(PROJ_NAME_STRIPPED "${PROJ_VENDOR}.${PROJ_NAME}")

  string(SHA512 PROJECT_HASH ${PROJ_NAME_STRIPPED})
  string(SUBSTRING ${PROJECT_HASH}
                   0
                   6
                   PROJECT_HASH_TRUNC)

  set(PROJECT_ROOT "${PROJ_VENDOR}+${PROJ_NAME}-${PROJECT_HASH_TRUNC}")
  set(PROJECT_ROOT "${PROJECT_ROOT}" PARENT_SCOPE)

  project("${PROJECT_ROOT}" ${ARGN})
  message("Adding project ${PROJECT_ROOT}")

  set(PROJECT_NAME "${PROJECT_NAME}" PARENT_SCOPE)

  if(NOT ZPM_PROJECT_NAME)
    set(ZPM_PROJECT_NAME "${PROJ_VENDOR}/${PROJ_NAME}" PARENT_SCOPE)
  endif()

endfunction()

function(zpm_module MODULE_NAME)
  get_filename_component(PROJ_NAME "${CMAKE_CURRENT_SOURCE_DIR}" NAME)
  get_filename_component(PROJ_VENDOR_DIR "${CMAKE_CURRENT_SOURCE_DIR}" PATH)
  get_filename_component(PROJ_VENDOR "${PROJ_VENDOR_DIR}" NAME)
  set(PROJ_NAME_STRIPPED "${PROJ_VENDOR}.${PROJ_NAME}")

  string(SHA512 PROJECT_HASH ${PROJ_NAME_STRIPPED})
  string(SUBSTRING ${PROJECT_HASH}
                   0
                   6
                   PROJECT_HASH_TRUNC)

  set(PROJECT_ROOT "${PROJ_VENDOR}+${PROJ_NAME}-${PROJECT_HASH_TRUNC}")
  set(PROJECT_ROOT "${PROJECT_ROOT}" PARENT_SCOPE)

  project("${PROJECT_ROOT}+${MODULE_NAME}" ${ARGN})
  message("Adding project ${PROJECT_ROOT}+${MODULE_NAME}")

  set(PROJECT_NAME "${PROJECT_NAME}" PARENT_SCOPE)

  if(NOT ZPM_PROJECT_NAME)
    set(ZPM_PROJECT_NAME "${PROJ_VENDOR}/${PROJ_NAME}" PARENT_SCOPE)
  endif()
  set(ZPM_PROJECT_MODULE "+${MODULE_NAME}" PARENT_SCOPE)

endfunction()

function(zpm_alias PROJ_NAME)

  set_target_properties("${PROJ_NAME}"
                        PROPERTIES FOLDER "extern/${ZPM_PROJECT_NAME}")

  string(REPLACE "/"
                 "::"
                 PROJ_NAME_ALIAS
                 "${ZPM_PROJECT_NAME}")
  add_library("${PROJ_NAME_ALIAS}${ZPM_PROJECT_MODULE}" ALIAS "${PROJ_NAME}")
  message(
    "Adding alias ${PROJ_NAME} => ${PROJ_NAME_ALIAS}${ZPM_PROJECT_MODULE}")

endfunction()

function(zpm_default_target PROJ_NAME)

  string(REPLACE "/"
                 "::"
                 PROJ_NAME_ALIAS
                 "${ZPM_PROJECT_NAME}")
  add_library("${PROJ_NAME_ALIAS}" ALIAS "${PROJ_NAME}")
  message("Adding target ${PROJ_NAME} => ${PROJ_NAME_ALIAS}")

endfunction()
