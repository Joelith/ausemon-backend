--------------------------------------------------------
--  DDL for Table TOP_OCCURRENCES
--------------------------------------------------------

  CREATE TABLE "AUSEMON"."TOP_OCCURRENCES" 
   (  "OCCURRENCE_NUMBER" NUMBER, 
  "SCIENTIFIC_NAME" VARCHAR2(200 BYTE), 
  "COMMON_NAME" VARCHAR2(200 BYTE), 
  "LATITUDE" NUMBER, 
  "LONGITUDE" NUMBER, 
  "LOCATION" "MDSYS"."SDO_GEOMETRY" 
   ) SEGMENT CREATION IMMEDIATE 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "APEX_5300514897588604" 
 VARRAY "LOCATION"."SDO_ELEM_INFO" STORE AS SECUREFILE LOB 
  ( TABLESPACE "APEX_5300514897588604" ENABLE STORAGE IN ROW CHUNK 8192
  CACHE  NOCOMPRESS  KEEP_DUPLICATES 
  STORAGE(INITIAL 106496 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)) 
 VARRAY "LOCATION"."SDO_ORDINATES" STORE AS SECUREFILE LOB 
  ( TABLESPACE "APEX_5300514897588604" ENABLE STORAGE IN ROW CHUNK 8192
  CACHE  NOCOMPRESS  KEEP_DUPLICATES 
  STORAGE(INITIAL 106496 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)) ;
--------------------------------------------------------
--  Constraints for Table TOP_OCCURRENCES
--------------------------------------------------------

  ALTER TABLE "AUSEMON"."TOP_OCCURRENCES" MODIFY ("OCCURRENCE_NUMBER" NOT NULL ENABLE);
  ALTER TABLE "AUSEMON"."TOP_OCCURRENCES" MODIFY ("SCIENTIFIC_NAME" NOT NULL ENABLE);
  ALTER TABLE "AUSEMON"."TOP_OCCURRENCES" MODIFY ("LATITUDE" NOT NULL ENABLE);
  ALTER TABLE "AUSEMON"."TOP_OCCURRENCES" MODIFY ("LONGITUDE" NOT NULL ENABLE);
