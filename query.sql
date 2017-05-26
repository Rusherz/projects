SELECT
    Ships.typeID AS ItemId,
    Ships.typeName AS ItemName,
    Skills.typeID AS SkillId,
    Skills.typeName AS RequiredSkill,
    COALESCE(
        SkillLevel.valueInt,
        SkillLevel.valueFloat
    ) AS RequiredLevel
FROM
    dgmTypeAttributes AS SkillName

INNER JOIN invTypes AS Ships
    ON Ships.typeID = SkillName.typeID
INNER JOIN invGroups AS Grouping
    ON Grouping.groupID = Ships.groupID
INNER JOIN invTypes AS Skills
    ON (Skills.typeID = SkillName.valueInt OR Skills.typeID = SkillName.valueFloat)
        AND SkillName.attributeID IN (182, 183, 184, 1285, 1289, 1290)
INNER JOIN dgmTypeAttributes AS SkillLevel
    ON SkillLevel.typeID = SkillName.typeID
        AND SkillLevel.attributeID IN (277, 278, 279, 1286, 1287, 1288)
WHERE
Ships.published = 1 AND
    ((SkillName.attributeID = 182 AND
        SkillLevel.attributeID = 277) OR
    (SkillName.attributeID = 183 AND
        SkillLevel.attributeID = 278) OR
    (SkillName.attributeID = 184 AND
        SkillLevel.attributeID = 279) OR
    (SkillName.attributeID = 1285 AND
        SkillLevel.attributeID = 1286) OR
    (SkillName.attributeID = 1289 AND
        SkillLevel.attributeID = 1287) OR
    (SkillName.attributeID = 1290 AND
        SkillLevel.attributeID = 1288))
ORDER BY ItemId
INTO OUTFILE '/var/lib/mysql-files/req.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';


LOAD DATA INFILE '/var/lib/mysql-files/req.csv' 
INTO TABLE Skills 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n';










SELECT * FROM Skills WHERE ItemName = "1600mm Steel Plates II" OR ItemName = "Reactive Armor Hardener" OR ItemName = "Energized Adaptive Nano Membrane II" OR ItemName = "Energized Adaptive Nano Membrane II" OR ItemName = "Shadow Serpentis Warp Scrambler" OR ItemName = "Shadow Serpentis Warp Disruptor" OR ItemName = "10MN Afterburner II" OR ItemName = "Remote Sensor Dampener II, Targeting Range Dampening Script" OR ItemName = "Remote Sensor Dampener II, Targeting Range Dampening Script" OR ItemName = "Remote Sensor Dampener II, Targeting Range Dampening Script" OR ItemName = "Covert Ops Cloaking Device II" OR ItemName = "[Empty High slot]" OR ItemName = "[Empty High slot]" OR ItemName = "[Empty High slot]" OR ItemName = "Medium Trimark Armor Pump II" OR ItemName = "Medium Trimark Armor Pump II" OR ItemName = "Warrior SW-300 x5";