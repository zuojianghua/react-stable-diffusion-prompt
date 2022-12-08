export const DBConfig = {
  name: 'PromptDB',
  version: 1,
  objectStoresMeta: [
    {
      store: 'prompt',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'context', keypath: 'context', options: { unique: false } },
      ],
    },
  ],
};

export const translateUrl = `https://service-f0uyu9db-1256086461.sh.apigw.tencentcs.com/a?i=`;
