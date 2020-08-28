export function getBlobUrl(blobName: string){
    if (blobName.substring(0, 5) == "https") return blobName;
    return `https://mrlinguasticblobs.blob.core.windows.net/images/${blobName}?sv=2019-12-12&ss=bfqt&srt=o&sp=rx&se=2021-08-28T20:58:09Z&st=2020-08-28T12:58:09Z&spr=https&sig=igpY0VHeNftYhjSiIVFKSdeAscwRCLVeVRH9VmOzu2Q=&_=1598623419376`
}