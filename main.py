from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_from_directory
from flask_mysqldb import MySQL
import MySQLdb.cursors
import os
#from views import get_stats

#VIEWS
#from views import views

#UTILITIES
import urllib.parse

#VARIABLES
passw = urllib.parse.quote_plus("u90Ws2X$a@7y")

app = Flask(__name__)

#app.register_blueprint(views,url_prefix="/")
app.config['MYSQL_HOST'] = os.environ['DBSERVER']
app.config['MYSQL_USER'] = os.environ['DBUSER']
app.config['MYSQL_PASSWORD'] = os.environ['DBPASS']
app.config['MYSQL_DB'] = os.environ['DBNAME']

mysql = MySQL(app)


@app.route('/')
def homepage():
  return render_template("homepage.html")  #CREATE THIS!


@app.route('/favicon.ico')
def favicon():
  return send_from_directory(os.path.join(app.root_path, 'static'),
                             'favicon.ico',
                             mimetype="image/vnd.microsoft.icon")


# REFERENCE Data
@app.route(
  '/api/v1/sets/', )
@app.route('/api/v1/sets/<setid>', methods=['GET'])
def get_sets(setid=None):
  cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
  if setid == None:
    sql = "SELECT * FROM ref_sets"
    qual = ""
  else:
    sql = "SELECT * FROM ref_sets where setid = %s"
    qual = setid
  #show all of them
  cursor.execute(sql, qual)
  result = cursor.fetchall()
  cursor.close()
  return jsonify(result)


@app.route(
  '/api/v1/setitems/', )
@app.route('/api/v1/setitems/<setid>', methods=['GET'])
def get_setitems(setid=None):
  cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
  if setid == None:
    sql = "SELECT si.*,sl.slotname FROM ref_setitems si left join ref_slots sl ON si.slotid = sl.slotid"
    qual = ""
  else:
    sql = "SELECT si.*,sl.slotname FROM ref_setitems si left join ref_slots sl ON si.slotid = sl.slotid where setid = %s"
    qual = setid
  #show all of them
  cursor.execute(sql, qual)
  result = cursor.fetchall()
  cursor.close()
  return jsonify(result)


@app.route(
  '/api/v1/slots/', )
@app.route('/api/v1/slots/<slotid>', methods=['GET'])
def get_slots(slotid=None):
  cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
  if slotid == None:
    sql = "SELECT slotid,slotname FROM ref_slots where isset = 1"
    qual = ""
  else:
    sql = "SELECT slotid,slotname FROM ref_slots where isset = 1 and slotid = %s"
    qual = slotid
  #show all of them
  cursor.execute(sql, qual)
  result = cursor.fetchall()
  cursor.close()
  return jsonify(result)


@app.route(
  '/api/v1/classes/', )
@app.route('/api/v1/classes/<classid>', methods=['GET'])
def get_classes(classid=None):
  cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
  if classid == None:
    sql = "SELECT * FROM ref_classes"
    qual = ""
  else:
    sql = "SELECT * FROM ref_classes where classid = %s"
    qual = classid
  #show all of them
  cursor.execute(sql, qual)
  result = cursor.fetchall()
  cursor.close()
  return jsonify(result)


@app.route(
  '/api/v1/dungeons/', )
@app.route('/api/v1/dungeons/<dungeonid>', methods=['GET'])
def get_dungeons(dungeonid=None):
  cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
  if dungeonid == None:
    sql = "SELECT * FROM ref_dungeons"
    qual = ""
  else:
    sql = "SELECT * FROM ref_dungeons where dungeonid = %s"
    qual = dungeonid
  #show all of them
  cursor.execute(sql, qual)
  result = cursor.fetchall()
  cursor.close()
  return jsonify(result)


#USER Equipment Data (GET/POST)
@app.route('/api/v1/equipment/<myid>', methods=['GET', 'POST'])
def get_equipment(myid, equipment_id=None):
  cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
  if request.method == 'GET':  #Return all Equipment for the User
    cursor.execute(
      f"""
      SELECT e.equipmentid,s.setname,si.setitemname,sl.slotname,e.strint,e.vit,e.will,e.fort,SUM(e.strint+e.vit+e.will+e.fort) as itemcr
      FROM my_equipment e
      LEFT JOIN ref_setitems si ON e.setitemid = si.setitemid
      LEFT JOIN ref_sets s ON si.setid = s.setid
      LEFT JOIN ref_slots sl ON si.slotid = sl.slotid
      WHERE e.uid in (SELECT uid from tmp_weblinks where tmp_uuid = %s) AND isequipped = 0
      GROUP by e.equipmentid
    """, (myid, ))
    result = cursor.fetchall()
    cursor.close
    return jsonify(result)
  elif request.method == 'POST':  #Add an Equipment Item for the User
    cursor.execute(
      f"""
        INSERT into my_equipment(uid,setitemid,strint,vit,will,fort,isequipped)
        SELECT uid,%s,%s,%s,%s,%s,b%s from tmp_weblinks where tmp_uuid = %s          
      """, (
        request.form['setitemid'],
        request.form['strint'],
        request.form['vit'],
        request.form['will'],
        request.form['fort'],
        request.form['isequipped'],
        myid,
      ))
    mysql.connection.commit()
    return 'success'
  else:
    return False


#USER Equipment Data (GET/POST) --COMBINE WITH ABOVE!
@app.route('/api/v1/equipped/<myid>', methods=['GET'])
def get_equipped(myid):
  cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
  if request.method == 'GET':  #Return all Equipment for the User
    cursor.execute(
      f"""
      SELECT e.equipmentid,s.setname,si.setitemname,sl.slotname,e.strint,e.vit,e.will,e.fort,SUM(e.strint+e.vit+e.will+e.fort) as itemcr
      FROM my_equipment e
      LEFT JOIN ref_setitems si ON e.setitemid = si.setitemid
      LEFT JOIN ref_sets s ON si.setid = s.setid
      LEFT JOIN ref_slots sl ON si.slotid = sl.slotid
      WHERE e.uid in (SELECT uid from tmp_weblinks where tmp_uuid = %s) AND isequipped = 1
      GROUP by e.equipmentid
    """, (myid, ))
    result = cursor.fetchall()
    cursor.close
    return jsonify(result)
  else:
    return False


#USER Equipment Data (DELETE)
@app.route('/api/v1/equipment/<myid>/<equipmentid>', methods=['DELETE'])
def del_equipment(myid, equipmentid=None):
  if (request.method == 'DELETE') and (
      equipmentid != None):  #Delete an Equipment Item for the User
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(
      f"""
        DELETE from my_equipment where equipmentid = %s and uid in (SELECT uid from tmp_weblinks where tmp_uuid = %s)
      """, (
        equipmentid,
        myid,
      ))
    mysql.connection.commit()
    return 'success'
  else:
    return False


#USER Equipment Data (Equip new item)
@app.route('/api/v1/equip/<myid>/<equipmentid>', methods=['POST'])
def upd_equipped(myid, equipmentid=None):
  if (request.method == 'POST') and (equipmentid != None):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(f"""
    CALL equip_item(%s,%s)
    """, (myid, equipmentid))
    mysql.connection.commit()
    cursor.close()
    return 'success'
  else:
    return False


#USER Unwanted Sets
@app.route('/api/v1/unwantedsets/<myid>', methods=['GET'])
def get_unwantedsets(myid):
  cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
  cursor.execute(
    f"""
        SELECT setid,setname FROM ref_sets where setid not in (select setid from my_setprefs where uid in (select uid from tmp_weblinks where tmp_uuid = %s))
      """, (myid, ))
  results = cursor.fetchall()
  cursor.close
  return jsonify(results)


#USER Wanted Sets
@app.route(
  '/api/v1/wantedsets/<myid>', )
@app.route('/api/v1/wantedsets/<myid>/<setid>',
           methods=['POST', 'GET', 'DELETE'])
def get_wantedsets(myid, setid=None):
  if (request.method == 'POST') and (setid != None):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(
      f"""
        insert into my_setprefs (uid,setid) 
        select uid, %s from tmp_weblinks where tmp_uuid = %s
      """, (
        setid,
        myid,
      ))
    mysql.connection.commit()
    cursor.close()
    return 'success'
  elif (request.method == 'GET'):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(f"""
        call wanted_set_logic(%s)
      """, (myid, ))
    results = cursor.fetchall()
    cursor.close
    return jsonify(results)
  elif (request.method == 'DELETE' and (setid != None)):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(
      f"""
        delete from my_setprefs where setid = %s and uid in (SELECT uid from tmp_weblinks where tmp_uuid = %s)
      """, (
        setid,
        myid,
      ))
    mysql.connection.commit()
    cursor.close()
    return 'success'
  else:
    return False


#USER Stats Data
@app.route('/mystats/<myid>')
def show_mystats(myid):
  cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
  cursor.execute(
    f"""SELECT classid from users where uid in (SELECT uid from tmp_weblinks where tmp_uuid = %s)""",
    (myid, ))
  result = cursor.fetchone()
  print(result)
  if result == 5 or result == 6:
    strintname = 'INT'
  else:
    strintname = 'STR'
  cursor.close()
  return render_template("layout.html", myid=myid, strintname=strintname)


@app.route('/api/v1/stats/<myid>', methods=['GET', 'POST'])
def get_stats(myid):
  cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
  if request.method == 'POST':
    cursor.execute(
      f"""
            UPDATE users
            SET
                charname = %s,
                classid  = %s,
                plvl     = %s,
                dmg      = %s,
                life     = %s,
                cr       = %s,
                reso     = %s
            WHERE
                uid = (SELECT uid from tmp_weblinks where tmp_uuid = %s)
            """, (
        request.form['charname'],
        request.form['charclass'],
        request.form['myplvl'],
        request.form['mydmg'],
        request.form['mylife'],
        request.form['mycr'],
        request.form['mylife'],
        myid,
      ))
    mysql.connection.commit()
    return 'success'
  elif request.method == 'GET':
    cursor.execute(
      """
            SELECT 
                u.*,g.guildname,g.guildserver 
            FROM users u
            LEFT JOIN guilds g ON u.d_gid = g.d_gid
            WHERE u.UID IN (SELECT uid from tmp_weblinks where tmp_uuid = %s)""",
      (myid, ))
    result = cursor.fetchone()
    return jsonify(result)
  cursor.close()


#MAIN EXECUTION
if __name__ == '__main__':
  app.run(debug=True, host="0.0.0.0", port=8000)
