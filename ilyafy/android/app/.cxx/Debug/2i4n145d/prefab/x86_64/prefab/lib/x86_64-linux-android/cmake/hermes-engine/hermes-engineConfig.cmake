if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/home/grishma/.gradle/caches/8.14.3/transforms/8c295ceb0cc9f36abb4e4e89a6f8655c/transformed/hermes-android-0.81.2-debug/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/grishma/.gradle/caches/8.14.3/transforms/8c295ceb0cc9f36abb4e4e89a6f8655c/transformed/hermes-android-0.81.2-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

