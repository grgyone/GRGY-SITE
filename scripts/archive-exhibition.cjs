// Local preservation only. No network downloads or platform extraction.
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const sharp=require('sharp');
const args=process.argv.slice(2);const option=name=>args[args.indexOf(name)+1];
if(!args.includes('--source')||!args.includes('--archive'))throw Error('Usage: node scripts/archive-exhibition.cjs --source PATH --archive PATH');
const source=path.resolve(option('--source')),archive=path.resolve(option('--archive')),repo=path.resolve(__dirname,'..');
const inside=(target,base)=>target.toLowerCase()===base.toLowerCase()||target.toLowerCase().startsWith(base.toLowerCase()+path.sep);
if(inside(archive,source)||inside(archive,repo)||inside(source,archive))throw Error('Archive must be outside source and public repository');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const writeSafe=(file,bytes)=>{fs.mkdirSync(path.dirname(file),{recursive:true});if(fs.existsSync(file)){if(hash(fs.readFileSync(file))!==hash(bytes))throw Error('Existing archive differs: '+file);}else fs.writeFileSync(file,bytes,{flag:'wx'});};
async function collect(directory){const out=[];for(const entry of fs.readdirSync(directory,{withFileTypes:true})){if(entry.isSymbolicLink())throw Error('Symlinks require explicit review');const file=path.join(directory,entry.name);if(entry.isDirectory())out.push(...await collect(file));else if(entry.isFile())out.push(file);}return out;}
function classify(name){if(/ChatGPT Image/i.test(name))return 'image_provenance_unverified';if(/COMPOSITIONS by/.test(name))return 'installation_screenshot';if(/IMG_/.test(name))return 'merchandise_photo';if(/Кураторский/.test(name))return 'exhibition_text';if(/Poster/i.test(name))return 'poster';if(/\.(glb|gltf|blend|fbx|obj|usdz)$/i.test(name))return 'model';if(/\.(mp4|mov|webm)$/i.test(name))return 'video';if(/\.psd$/i.test(name))return 'design_source';if(/\.txt$/i.test(name))return 'text';return 'supporting_graphic';}
(async()=>{
const files=[];for(const file of await collect(source)){
const relative=path.relative(source,file);const bytes=fs.readFileSync(file);const dest=path.join(archive,'originals',relative);writeSafe(dest,bytes);
const record={relativePath:relative.replaceAll('\\','/'),archivePath:'originals/'+relative.replaceAll('\\','/'),bytes:bytes.length,sha256:hash(bytes),category:classify(relative),originalModifiedAt:fs.statSync(file).mtime.toISOString(),rights:'owner review required for redistribution; local preservation copy',publicUse:['COMPOSITIONS by WkdjSrOfcQbHK11H02zH0V1Kkuq1.jpg','Poster A3 v2.png'].includes(relative)};
if(/\.(png|jpe?g|webp)$/i.test(file)){const m=await sharp(bytes).metadata();record.image={width:m.width,height:m.height,hasAlpha:m.hasAlpha};}
files.push(record);
}
for(const dir of ['documentation','screenshots','video/walkthrough','scene/authorized-exports','scene/textures','artworks','metadata','rights'])fs.mkdirSync(path.join(archive,dir),{recursive:true});
const manifest={schemaVersion:1,project:'COMPOSITIONS',subtitle:'Selected Works 2022–2024',artist:'GRGY (Grgy Sukhanov)',opening:'2025-06',originalUrl:'https://oncyber.io/compositions',sourceDirectory:source,createdAt:new Date().toISOString(),files,summary:{count:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0),models:files.filter(f=>f.category==='model').length,videos:files.filter(f=>f.category==='video').length},missing:['room geometry and redistribution licence','Kloud source model and textures','separate exhibited artwork masters and item list','artwork transforms and physical dimensions','lighting/environment settings','navigation spawn, camera, colliders/navmesh','multi-angle documentary screenshots','recorded walkthrough'],sceneExportStatus:'not obtained; owner-side export capability unconfirmed'};
fs.writeFileSync(path.join(archive,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const initialize=(name,content)=>{if(!fs.existsSync(path.join(archive,name)))writeSafe(path.join(archive,name),Buffer.from(content));};
initialize('metadata/scene-inventory.json',JSON.stringify({status:'awaiting_authorized_owner_export',coordinateSystem:null,units:null,room:null,kloud:null,artworks:[],lighting:null,environment:null,camera:null,spawn:null,navigation:null,rights:[]},null,2)+'\n');
initialize('metadata/artwork-placement-template.csv','id,title,year,source_file,width_m,height_m,x,y,z,rotation_x,rotation_y,rotation_z,scale_x,scale_y,scale_z,rights_evidence\n');
initialize('README.md','# COMPOSITIONS preservation archive\n\nOriginals are byte-identical copies; manifest.json records SHA-256 and measured dimensions. Re-running the script refuses to overwrite differing source copies. Review image provenance and licences before public redistribution. Empty scene/video/artworks folders identify missing material; this archive is not yet a playable standalone exhibition. Keep a second copy on another device and verify hashes regularly. Public website files are a separate selection.\n');
console.log(JSON.stringify({archive,summary:manifest.summary}));
})();
