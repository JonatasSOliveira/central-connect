export type KeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? K | `${K}.${KeyOf<T[K]>}`
        : never
    }[keyof T]
  : never
