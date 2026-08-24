require('reflect-metadata');
const { plainToInstance } = require('class-transformer');
const mod = require('D:/Testsite/minecraftsite/apps/api/dist/src/modules/projects/dto/query-projects.dto.js');
const dto = plainToInstance(
  mod.QueryProjectsDto,
  { projectTypes: 'MODPACK', search: 'sodium', loaders: 'FABRIC' },
  { enableImplicitConversion: true, exposeExcludedProperties: true },
);
console.log('projectTypes:', JSON.stringify(dto.projectTypes));
console.log('search:', JSON.stringify(dto.search));
console.log('loaders:', JSON.stringify(dto.loaders));
process.exit(0);
