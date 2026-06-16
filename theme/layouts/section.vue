<template>
  <div class="slidev-layout section h-full flex flex-col items-center justify-center px-14">
    <BrandCorner size="large" />
    <div class="relative z-10 flex flex-col items-center">
      <GoldDivider width="64px" class="mb-7" />
      <slot />
    </div>
  </div>
</template>
