<template>
  <div class="slidev-layout two-cols h-full px-14 py-10">
    <BrandCorner size="small" />
    <div class="relative z-10 h-full grid grid-cols-2 gap-8">
      <div class="col-left flex flex-col justify-center pr-6 border-r-2" style="border-color: color-mix(in srgb, var(--brand-accent) 40%, transparent);">
        <slot name="default" />
      </div>
      <div class="col-right flex flex-col justify-center pl-2">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>
